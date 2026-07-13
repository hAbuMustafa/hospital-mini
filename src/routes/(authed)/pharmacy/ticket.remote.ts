import { form, getRequestEvent, query } from "$app/server";
import { isNarcotic, unacceptedAmount } from "$lib/CONSTANTS";
import { db } from "$lib/server/db";
import { patients_view, transactions, transactionTickets } from "$lib/server/db/schema";
import { invalid } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";
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

    const ticketId = await db.transaction(async (tx) => {
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
        .values(data.drugs.map((d) => ({ ...d, qty: d.qty * -1, ticket_id: ticket.id })));

      return ticket.id;
    });

    /** TODO: If the ticket includes narcotics:
     * 1. Append to Narcotics Google Sheet.
     * 2. Update local count on `status` table of narcotics.
     */

    return {
      success: true,
      ticketId,
    };
  }
);
