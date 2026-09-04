import { command, form, getRequestEvent, query } from "$app/server";
import { formatDate } from "$lib/date/utils";
import { db } from "$lib/server/db/";
import {
  drugs,
  invoiceExtraItems,
  invoices,
  patients_view,
  patientTransfers,
  transactions,
  transactionTickets,
  user,
} from "$lib/server/db/schema";
import { totalAndAmount } from "$lib/utils/query";
import { error, invalid } from "@sveltejs/kit";
import { and, desc, eq, getTableColumns, gt, gte, lte, sql } from "drizzle-orm";
import * as v from "valibot";
import { getSystemFirstDate } from "../CONSTANTS.remote";

export const getPatient = query(v.string(), async (patientId) => {
  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  return patient;
});

export const getPatientWithTransfers = query(v.string(), async (patientId) => {
  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  const transfers = await db
    .select()
    .from(patientTransfers)
    .where(eq(patientTransfers.patient_id, patientId));

  return { ...patient, transfers };
});

export const getInvoiceMetadata = query(v.number(), async (invoiceNumber) => {
  const [invoice] = await db
    .select({ ...getTableColumns(invoices), username: user.name })
    .from(invoices)
    .leftJoin(user, eq(invoices.issued_by, user.id))
    .where(eq(invoices.id, invoiceNumber));

  if (!invoice) error(404, { message: "لا توجد فاتورة بالرقم المطلوب" });

  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, invoice.patient_id));

  return { ...invoice, patient };
});

export const getInvoice = query(v.number(), async (invoiceNumber) => {
  const invoice = await getInvoiceMetadata(invoiceNumber);
  const systemFirstDate = await getSystemFirstDate();

  const items = await db
    .select({
      ...getTableColumns(drugs),
      user_name: user.name,
      amount: sql<number>`SUM(${transactions.qty} - IFNULL(${transactions.qty_returned}, 0))`,
      total: sql<number>`SUM(${transactions.qty} - IFNULL(${transactions.qty_returned}, 0)) * ${drugs.price_resale}`,
    })
    .from(transactions)
    .leftJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
    .leftJoin(drugs, eq(transactions.item_id, drugs.id))
    .leftJoin(user, eq(transactionTickets.user_id, user.id))
    .where(
      and(
        eq(transactionTickets.patient_id, invoice.patient_id),
        gte(transactionTickets.timestamp, invoice.from),
        lte(transactionTickets.timestamp, invoice.to)
      )
    )
    .groupBy(transactions.item_id)
    .having((thisView) => gt(thisView.amount, 0));

  if (invoice.from < systemFirstDate) {
    const extraItems = await db
      .select({
        ...getTableColumns(drugs),
        user_name: user.name,
        amount: invoiceExtraItems.qty,
        total: sql<number>`${invoiceExtraItems.qty} * ${drugs.price_resale}`,
      })
      .from(invoiceExtraItems)
      .where(eq(invoiceExtraItems.invoice_id, invoiceNumber))
      .leftJoin(user, eq(invoiceExtraItems.added_by, user.id))
      .leftJoin(drugs, eq(invoiceExtraItems.item_id, drugs.id));

    if (extraItems.length) {
      for (const xItem of extraItems) {
        const foundDispenseIndex = items.findIndex((drug) => drug.id === xItem.id);

        if (foundDispenseIndex > -1) {
          items[foundDispenseIndex].amount += xItem.amount;
          items[foundDispenseIndex].total =
            items[foundDispenseIndex].amount * items[foundDispenseIndex].price_resale!;
        } else {
          items.push(xItem);
        }
      }
    }
  }

  return {
    ...invoice,
    items,
    grandTotal: items.reduce((tally, curr) => tally + curr.total, 0),
  };
});

export const getInvoiceExtraItems = query(v.number(), async (invoiceNumber) => {
  return await db
    .select({
      ...getTableColumns(invoiceExtraItems),
      user_name: user.displayUsername,
      item_name: drugs.name_ar,
      item_tradename: drugs.tradename_ar,
      item_unit: drugs.unit,
    })
    .from(invoiceExtraItems)
    .where(eq(invoiceExtraItems.invoice_id, invoiceNumber))
    .leftJoin(user, eq(invoiceExtraItems.added_by, user.id))
    .leftJoin(drugs, eq(invoiceExtraItems.item_id, drugs.id));
});

export const getPeriodExtraItems = query(
  v.object({
    patientId: v.string(),
    from: v.date(),
    to: v.date(),
  }),
  async (data) => {
    return await db
      .select({
        id: drugs.id,
        name: drugs.name_ar,
        ...totalAndAmount(),
      })
      .from(transactions)
      .leftJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
      .leftJoin(drugs, eq(transactions.item_id, drugs.id))
      .where(
        and(
          eq(transactionTickets.patient_id, data.patientId),
          gte(transactionTickets.timestamp, data.from),
          lte(transactionTickets.timestamp, data.to)
        )
      )
      .groupBy(transactions.item_id);
  }
);

export const addInvoiceExtraItem = command(
  v.object({
    invoiceId: v.number(),
    drugId: v.number(),
    drugUnitPrice: v.number(),
  }),
  async (data) => {
    await db.insert(invoiceExtraItems).values({
      invoice_id: data.invoiceId,
      item_id: data.drugId,
      added_by: getRequestEvent().locals.user?.id!,
      unit_price: data.drugUnitPrice,
    });

    void getInvoiceExtraItems(data.invoiceId).refresh();
  }
);

export const updateInvoiceExtraItem = form(
  v.object({ invoiceId: v.number(), itemId: v.number(), amount: v.number() }),
  async (data) => {
    await db
      .update(invoiceExtraItems)
      .set({ qty: data.amount })
      .where(
        and(
          eq(invoiceExtraItems.invoice_id, data.invoiceId),
          eq(invoiceExtraItems.id, data.itemId)
        )
      );

    void getInvoiceExtraItems(data.invoiceId).refresh();
  }
);

export const updateInvoiceExtraItemAmount = command(
  v.object({ invoiceId: v.number(), itemId: v.number(), amount: v.number() }),
  async (data) => {
    await db
      .update(invoiceExtraItems)
      .set({ qty: data.amount })
      .where(
        and(
          eq(invoiceExtraItems.invoice_id, data.invoiceId),
          eq(invoiceExtraItems.id, data.itemId)
        )
      );

    void getInvoiceExtraItems(data.invoiceId).refresh();
  }
);

export const deleteInvoiceExtraItem = command(
  v.object({
    itemId: v.number(),
    invoiceId: v.number(),
  }),
  async (data) => {
    await db
      .delete(invoiceExtraItems)
      .where(
        and(
          eq(invoiceExtraItems.invoice_id, data.invoiceId),
          eq(invoiceExtraItems.id, data.itemId)
        )
      );

    void getInvoiceExtraItems(data.invoiceId).refresh();
  }
);

export const getDispenses = query(
  v.object({
    patientId: v.string(),
    fromDate: v.date(),
    toDate: v.date(),
  }),
  async (data) => {
    const [patient] = await db
      .select()
      .from(patients_view)
      .where(eq(patients_view.id, data.patientId));

    try {
      const [periodWard] = await db
        .select()
        .from(patientTransfers)
        .where(
          and(
            eq(patientTransfers.patient_id, data.patientId),
            lte(patientTransfers.timestamp, data.fromDate)
          )
        )
        .orderBy(desc(patientTransfers.id))
        .limit(1);

      const dispenses = await db
        .select({
          ...getTableColumns(drugs),
          amount: sql<number>`SUM(${transactions.qty} - IFNULL(${transactions.qty_returned}, 0))`,
          total: sql<number>`SUM(${transactions.qty} - IFNULL(${transactions.qty_returned}, 0)) * ${drugs.price_resale}`,
        })
        .from(transactions)
        .innerJoin(drugs, eq(transactions.item_id, drugs.id))
        .innerJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
        .where(
          and(
            eq(transactionTickets.patient_id, data.patientId),
            gte(transactionTickets.timestamp, data.fromDate),
            lte(transactionTickets.timestamp, data.toDate)
          )
        )
        .groupBy(transactions.item_id)
        .having((thisView) => gt(thisView.amount, 0));

      return {
        ward: periodWard.to_ward ?? patient.ward_on_admission,
        dispenses,
      };
    } catch (err) {
      console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), err);

      return {
        ward: patient.ward_on_admission,
        dispenses: [],
        error: err,
      };
    }
  }
);

export const createInvoice = form(
  v.object({
    patientId: v.string(),
    fromTransferId: v.number(),
    toTransferId: v.number(),
    keepOpen: v.optional(v.boolean()),
  }),
  async (data, issue) => {
    const [patient] = await db
      .select()
      .from(patients_view)
      .where(eq(patients_view.id, data.patientId));

    if (!patient) invalid(issue.patientId("لا يوجد مريض مسجل برقم الملف المطلوب"));

    const transfers = await db
      .select()
      .from(patientTransfers)
      .where(
        and(
          eq(patientTransfers.patient_id, data.patientId),
          gte(patientTransfers.id, data.fromTransferId)
        )
      )
      .orderBy(patientTransfers.timestamp);

    if (!transfers.length) invalid(issue("الفترة المختارة خارج فترة إقامة المريض"));

    const endTransferIndex = transfers.findIndex((t) => t.id === data.toTransferId);

    const from = transfers[0].timestamp!;
    const to =
      endTransferIndex < transfers.length - 1
        ? transfers[endTransferIndex]?.timestamp!
        : (patient.discharge_date ?? new Date());

    const issued_by = getRequestEvent().locals.user?.id!;
    const issuing_department = getRequestEvent().locals.user?.affiliation!;

    if (!issuing_department)
      invalid(issue("أنت غير تابع لأي جهة. لا يمكنك تسجيل فواتير"));

    try {
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          patient_id: data.patientId,
          from,
          to,
          period_ward:
            transfers.length > 1
              ? transfers
                  .filter((_, i) => i < transfers.length - 1 && i < endTransferIndex)
                  .map((p) => p.to_ward)
                  .join(" - ")
              : transfers[0].to_ward!,
          issued_by,
          issuing_department,
          is_closed: !data.keepOpen,
        })
        .returning();

      return {
        success: true,
        invoiceId: newInvoice.id,
        addItems: !newInvoice.is_closed,
      };
    } catch (error) {
      console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), error);
      invalid(issue((error as { message: string }).message));
    }
  }
);

export const getPatientInvoices = query(v.string(), async (patientId) => {
  return await db
    .select({
      ...getTableColumns(invoices),
      user_name: user.displayUsername,
    })
    .from(invoices)
    .leftJoin(user, eq(invoices.issued_by, user.id))
    .where(
      and(
        eq(invoices.patient_id, patientId),
        eq(invoices.issuing_department, getRequestEvent().locals.user?.affiliation!)
      )
    );
});

export const copyInvoice = form(
  v.object({
    invoiceId: v.number(),
  }),
  async (data) => {
    try {
      const [oldInvoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, data.invoiceId));

      const oldInvoiceItems = await db
        .select()
        .from(invoiceExtraItems)
        .where(eq(invoiceExtraItems.invoice_id, data.invoiceId));

      const [newInvoice] = await db
        .insert(invoices)
        .values({
          ...oldInvoice,
          id: undefined,
          is_closed: undefined,
          is_cancelled: undefined,
          issued_at: undefined,
          issued_by: getRequestEvent().locals.user?.id!,
        })
        .returning();

      await db.insert(invoiceExtraItems).values(
        oldInvoiceItems.map((item) => ({
          ...item,
          id: undefined,
          invoice_id: newInvoice.id,
          added_by: newInvoice.issued_by,
          added_at: newInvoice.issued_at,
        }))
      );

      return { newInvoiceId: newInvoice.id };
    } catch (err) {
      console.error(err);
    }
  }
);

export const closeInvoice = command(v.number(), async (invoiceNumber) => {
  const [invoice] = await db
    .update(invoices)
    .set({ is_closed: true })
    .where(eq(invoices.id, invoiceNumber))
    .returning();

  void getPatientInvoices(invoice.patient_id).refresh();
});

export const cancelInvoice = command(v.number(), async (invoiceNumber) => {
  const [invoice] = await db
    .update(invoices)
    .set({ is_cancelled: true, is_closed: true })
    .where(eq(invoices.id, invoiceNumber))
    .returning();

  void getPatientInvoices(invoice.patient_id).refresh();
});
