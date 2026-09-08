import { form, getRequestEvent, query } from "$app/server";
import { isNarcotic, unacceptedAmount } from "$lib/CONSTANTS";
import { db } from "$lib/server/db";
import {
  drugs,
  patients_view,
  status,
  transactions,
  transactionTickets,
  unsyncedNarcotics,
  user,
} from "$lib/server/db/schema";
import { saveNarcoticTicketToGoogleSheet } from "$lib/server/gcp/sheets";
import { invalid } from "@sveltejs/kit";
import {
  and,
  desc,
  eq,
  gte,
  isNotNull,
  gt,
  lte,
  isNull,
  sql,
  not,
  like,
  notLike,
  inArray,
} from "drizzle-orm";
import * as v from "valibot";
import { isReturnable } from "./utils";
import { PUBLIC_store_id } from "$env/static/public";

export const getPatient = query(v.string(), async (patientId) => {
  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  if (!patient) {
    return {
      id: patientId,
    };
  } else {
    return patient;
  }
});

export const getItemLastDispensed = query(
  v.object({
    patientId: v.string(),
    itemId: v.number(),
  }),
  async ({ patientId, itemId }) => {
    const lastDispense = await db
      .select({
        ticketId: transactionTickets.id,
        timestamp: transactionTickets.timestamp,
        itemId: transactions.item_id,
        qty: transactions.qty,
      })
      .from(transactionTickets)
      .leftJoin(transactions, eq(transactionTickets.id, transactions.ticket_id))
      .where(
        and(
          eq(transactionTickets.patient_id, patientId),
          eq(transactions.item_id, itemId)
        )
      )
      .orderBy(desc(transactionTickets.timestamp));

    return lastDispense;
  }
);

export const postTicket = form(
  v.object({
    patientId: v.pipe(v.string(), v.nonEmpty()),
    drugs: v.array(
      v.object({
        item_id: v.number(),
        item_name: v.string(),
        category: v.string(),
        qty: v.number(),
        unit_price: v.number(),
      })
    ),
  }),
  async (data, issue) => {
    const hasInvalidBoxQt = data.drugs.findIndex((d) =>
      unacceptedAmount(d.item_id, d.qty)
    );
    if (hasInvalidBoxQt > -1) {
      invalid(issue.drugs[hasInvalidBoxQt]("الصنف يصرف بالعلبة وليس بالوحدة الصغرى"));
    }

    const hasInvalidQt = data.drugs.findIndex((d) => d.qty < 1);
    if (hasInvalidQt > -1) {
      invalid(issue.drugs[hasInvalidQt]("برجاء إدخال كمية صحيحة"));
    }

    const hasNarcotics = data.drugs.some((d) => isNarcotic(d));

    if (hasNarcotics && data.drugs.length > 1) {
      invalid(
        issue(
          "لا يمكن كتابة أصناف أخرى مع المخدرات في نفس الطلبية، أو كتابة أكثر من مخدر في نفس الطلبية"
        )
      );
    }

    const currentUser = getRequestEvent().locals.user;

    const { ticket: insertedTicket, ticketItems: insertedItems } = await db.transaction(
      async (tx) => {
        const [ticket] = await tx
          .insert(transactionTickets)
          .values({
            patient_id: data.patientId,
            store_id: currentUser?.affiliation!,
            user_id: currentUser?.id!,
            is_dispense: true,
          })
          .returning();

        const ticketItems = await tx
          .insert(transactions)
          .values(data.drugs.map((d) => ({ ...d, ticket_id: ticket.id })))
          .returning();

        return { ticket, ticketItems };
      }
    );

    if (hasNarcotics && insertedTicket.id) {
      const sheetPostResult = await saveNarcoticTicketToGoogleSheet(insertedTicket.id, [
        insertedTicket.timestamp!,
        insertedTicket.patient_id!,
        null,
        data.drugs[0].item_name,
        data.drugs[0].qty,
      ]);

      if (sheetPostResult?.updatedRange) {
        await db
          .update(status)
          .set({ value: sql`${status.value ?? 0} + 1` })
          .where(eq(status.item, "narcotics_dispensed"));
      } else {
        await db.insert(unsyncedNarcotics).values({
          ticket_id: insertedTicket.id,
          ticket_timestamp: insertedTicket.timestamp!,
          patient_id: insertedTicket.patient_id!,
          item_name: data.drugs[0].item_name,
          qty: insertedItems[0].qty,
        });

        return {
          success: true,
          ticketId: insertedTicket.id,
          message: `لم يتم حفظ التذكرة ${insertedTicket.id} في السجل الأونلاين`,
        };
      }
    }

    return {
      success: true,
      ticketId: insertedTicket.id,
    };
  }
);

export const getTickets = query(
  v.object({
    from: v.date(),
    to: v.date(),
  }),
  async (data) => {
    const currentUser = getRequestEvent().locals.user;

    const tickets = await db
      .select({
        ticket_id: transactionTickets.id,
        timestamp: transactionTickets.timestamp,
        user_name: user.name,
        patient_id: transactionTickets.patient_id,
        patient_name: patients_view.name,
        item_id: drugs.id,
        item_name: drugs.name_ar,
        item_tradename: drugs.tradename_ar,
        qty: transactions.qty,
        qty_returned: transactions.qty_returned,
        is_dispense: transactionTickets.is_dispense,
      })
      .from(transactionTickets)
      .where(
        and(
          currentUser?.role === "admin"
            ? isNotNull(transactionTickets.store_id)
            : eq(transactionTickets.store_id, Number(PUBLIC_store_id)),
          gte(transactionTickets.timestamp, data.from),
          lte(transactionTickets.timestamp, data.to),
          isNotNull(transactionTickets.patient_id)
        )
      )
      .leftJoin(transactions, eq(transactions.ticket_id, transactionTickets.id))
      .leftJoin(patients_view, eq(transactionTickets.patient_id, patients_view.id))
      .leftJoin(drugs, eq(transactions.item_id, drugs.id))
      .leftJoin(user, eq(transactionTickets.user_id, user.id));

    return Object.entries(Object.groupBy(tickets, (t) => t.ticket_id));
  }
);

export const getTicket = query(v.number(), async (ticketNumber) => {
  const currentUser = getRequestEvent().locals.user;

  const ticket = await db
    .select({
      transaction_id: transactions.id,
      ticket_id: transactionTickets.id,
      timestamp: transactionTickets.timestamp,
      user_name: user.name,
      patient_id: patients_view.id,
      patient_name: patients_view.name,
      item_id: drugs.id,
      item_name: drugs.name_ar,
      item_tradename: drugs.tradename_ar,
      item_unit_price: drugs.price,
      qty: transactions.qty,
      qty_returned: transactions.qty_returned,
      is_dispense: transactionTickets.is_dispense,
    })
    .from(transactionTickets)
    .where(
      and(
        currentUser?.role === "admin"
          ? isNotNull(transactionTickets.store_id)
          : eq(transactionTickets.store_id, Number(PUBLIC_store_id)),
        eq(transactionTickets.is_dispense, true),
        isNull(transactionTickets.return_on_ticket_id),
        gt(transactionTickets.timestamp, new Date(new Date().getDate() - 2)),
        eq(transactionTickets.id, ticketNumber),
        isNotNull(transactionTickets.patient_id)
      )
    )
    .leftJoin(transactions, eq(transactions.ticket_id, transactionTickets.id))
    .leftJoin(patients_view, eq(transactionTickets.patient_id, patients_view.id))
    .leftJoin(drugs, eq(transactions.item_id, drugs.id))
    .leftJoin(user, eq(transactionTickets.user_id, user.id));

  return ticket;
});

export const returnItems = form(
  v.object({
    originalTicketId: v.number(),
    items: v.array(
      v.object({
        itemId: v.number(),
        itemUnitPrice: v.number(),
        transactionId: v.number(),
        returnedAmount: v.number(),
      })
    ),
  }),
  async (data, issue) => {
    const [originalTicket] = await db
      .select()
      .from(transactionTickets)
      .where(eq(transactionTickets.id, data.originalTicketId));

    if (!originalTicket) return invalid(issue("رقم التذكرة غير صحيح"));

    if (!isReturnable(originalTicket.timestamp!))
      return invalid(issue("التذكرة غير قابلة للارتجاع"));

    const currentUser = getRequestEvent().locals.user;

    const returnedItems = data.items.filter((item) => item.returnedAmount > 0);

    if (!returnedItems.length) invalid(issue("لم تقم بكتابة أي كميات للارتجاع"));

    const result = await db.transaction(async (tx) => {
      try {
        const [newTicket] = await tx
          .insert(transactionTickets)
          .values({
            is_dispense: false,
            store_id: Number(PUBLIC_store_id),
            user_id: currentUser?.id!,
            patient_id: originalTicket.patient_id,
            return_on_ticket_id: originalTicket.id,
          })
          .returning();

        await tx.insert(transactions).values(
          returnedItems.map((item) => ({
            ticket_id: newTicket.id,
            item_id: item.itemId,
            unit_price: item.itemUnitPrice,
            qty: item.returnedAmount,
          }))
        );

        for (const item of returnedItems) {
          await tx
            .update(transactions)
            .set({
              qty_returned: sql`COALESCE(${transactions.qty_returned}, 0) + ${item.returnedAmount}`,
            })
            .where(eq(transactions.id, item.transactionId));
        }

        return {
          success: true,
          ticketId: newTicket.id,
        };
      } catch (error) {
        return {
          success: false,
          error,
        };
      }
    });

    return result;
  }
);

export const getUnlinkedTickets = query(async () => {
  return await db
    .selectDistinct({ name: transactionTickets.patient_id })
    .from(transactionTickets)
    .where(notLike(transactionTickets.patient_id, "%/%"));
});

export const linkTickets = form(
  v.object({
    patient_names: v.pipe(v.array(v.string()), v.minLength(1)),
    link_to_id: v.pipe(v.string(), v.nonEmpty()),
  }),
  async (data) => {
    await db
      .update(transactionTickets)
      .set({ patient_id: data.link_to_id })
      .where(inArray(transactionTickets.patient_id, data.patient_names));
  }
);
