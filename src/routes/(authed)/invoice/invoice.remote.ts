import { command, form, getRequestEvent, query } from "$app/server";
import { formatDate, parseDate } from "$lib/date/utils";
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
import { invalid } from "@sveltejs/kit";
import { and, desc, eq, getTableColumns, gt, gte, lte } from "drizzle-orm";
import * as v from "valibot";

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
          ...totalAndAmount(),
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
    fromTimestamp: v.string(),
    toTimestamp: v.string(),
    keepOpen: v.optional(v.boolean()),
  }),
  async (data, issue) => {
    const [patient] = await db
      .select()
      .from(patients_view)
      .where(eq(patients_view.id, data.patientId));

    if (!patient) invalid(issue.patientId("لا يوجد مريض مسجل برقم الملف المطلوب"));

    const from = parseDate(data.fromTimestamp)!;
    const to = parseDate(data.toTimestamp)!;

    if (from < patient.admission_date)
      invalid(issue.fromTimestamp("تاريخ بداية الفترة يسبق تاريخ الدخول"));

    if (patient.discharge_date && to > patient.discharge_date)
      invalid(issue.toTimestamp("تاريخ نهاية الفترة بعد تاريخ الخروج"));

    const transfers = await db
      .select()
      .from(patientTransfers)
      .where(
        and(
          eq(patientTransfers.patient_id, data.patientId),
          gte(patientTransfers.timestamp, from),
          lte(patientTransfers.timestamp, to)
        )
      );

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
          period_ward: transfers.map((p) => p.to_ward).join(" - "),
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
