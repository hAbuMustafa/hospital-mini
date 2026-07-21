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
import { and, desc, eq, gte, inArray, isNotNull, lte } from "drizzle-orm";
import * as v from "valibot";

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
    const [lastDispense] = await db
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

    if (data.drugs.some((d) => isNarcotic(d.item_id)) && data.drugs.length > 1) {
      invalid(
        issue(
          "لا يمكن كتابة أصناف أخرى مع المخدرات في نفس الطلبية، أو كتابة أكثر من مخدر في نفس الطلبية"
        )
      );
    }

    const { ticket: insertedTicket, ticketItems: insertedItems } = await db.transaction(
      async (tx) => {
        const [ticket] = await tx
          .insert(transactionTickets)
          .values({
            patient_id: data.patientId,
            store_id: 1, // todo: reset by user's affiliation
            user_id: getRequestEvent().locals.user?.id!,
            is_dispense: true,
          })
          .returning();

        const ticketItems = await tx
          .insert(transactions)
          .values(
            data.drugs.map((d) => ({ ...d, qty: d.qty * -1, ticket_id: ticket.id }))
          )
          .returning();

        return { ticket, ticketItems };
      }
    );

    if (insertedTicket.id) {
      const sheetPostResult = await saveNarcoticTicketToGoogleSheet(insertedTicket.id, [
        insertedTicket.timestamp!,
        insertedTicket.patient_id!,
        null,
        data.drugs[0].item_name,
        data.drugs[0].qty,
      ]);

      if (sheetPostResult?.updatedRange) {
        const [currentNarcoticsCount] = await db
          .select({ value: status.value })
          .from(status)
          .where(eq(status.item, "narcotics_dispensed"));

        await db
          .update(status)
          .set({ value: (currentNarcoticsCount.value ?? 0) + 1 })
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
    const tickets = await db
      .select({
        ticket_id: transactionTickets.id,
        timestamp: transactionTickets.timestamp,
        user_name: user.name,
        patient_id: patients_view.id,
        patient_name: patients_view.name,
        item_id: drugs.id,
        item_name: drugs.name_ar,
        item_tradename: drugs.tradename_ar,
        qty: transactions.qty,
        is_dispense: transactionTickets.is_dispense,
      })
      .from(transactionTickets)
      .where(
        and(
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
