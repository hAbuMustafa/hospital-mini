import { form, getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { patients_view, transactions, transactionTickets } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import * as v from "valibot";

export const getPatient = query(v.string(), async (patientId) => {
  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  if (!patient) {
    return;
  } else {
    return patient;
  }
});

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
  async (data) => {
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
