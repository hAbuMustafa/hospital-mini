import { form, getRequestEvent, query } from "$app/server";
import { PUBLIC_store_id } from "$env/static/public";
import { db } from "$lib/server/db";
import {
  drugs,
  patientAdmissions,
  status,
  transactions,
  transactionTickets,
  unsyncedNarcotics,
} from "$lib/server/db/schema";
import { saveNarcoticTicketToGoogleSheet } from "$lib/server/gcp/sheets";
import { totalAndAmount } from "$lib/utils/query";
import { invalid } from "@sveltejs/kit";
import { and, eq, getTableColumns, gte, isNotNull, lte, ne, sql, sum } from "drizzle-orm";
import * as v from "valibot";

export const getDrugsTransactionAmountTotals = query(
  v.object({
    from: v.date(),
    to: v.date(),
  }),
  async (data) => {
    const currentUser = getRequestEvent().locals.user;

    const totals = await db
      .select({
        item_name: drugs.name_ar,
        item_tradename: drugs.tradename_ar,
        ...totalAndAmount(false),
      })
      .from(transactions)
      .leftJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
      .leftJoin(drugs, eq(transactions.item_id, drugs.id))
      .where(
        and(
          currentUser?.role === "admin"
            ? isNotNull(transactionTickets.store_id)
            : eq(transactionTickets.store_id, Number(PUBLIC_store_id)),
          gte(transactionTickets.timestamp, data.from),
          lte(transactionTickets.timestamp, data.to)
        )
      )
      .groupBy(transactions.item_id)
      .having((thisTable) => ne(thisTable.amount, 0))
      .orderBy(drugs.category);

    return totals;
  }
);

export const getNotUploadedNarcoticTickets = query(async () => {
  return await db
    .select({
      ...getTableColumns(unsyncedNarcotics),
      patient_name: patientAdmissions.name,
    })
    .from(unsyncedNarcotics)
    .leftJoin(patientAdmissions, eq(unsyncedNarcotics.patient_id, patientAdmissions.id));
});

export const retryNarcoticUpload = form(
  v.object({ id: v.number() }),
  async (data, issue) => {
    const [item] = await db
      .select()
      .from(unsyncedNarcotics)
      .where(eq(unsyncedNarcotics.id, data.id));

    if (!item) invalid(issue("تذكرة غير موجودة أو تم رفعها بالفعل"));

    const appendResult = await saveNarcoticTicketToGoogleSheet(item.id, [
      item.ticket_timestamp,
      item.patient_id,
      null,
      item.item_name,
      item.qty,
    ]);

    if (!appendResult) invalid(issue("خطأ في رفع التذكرة"));

    await db.delete(unsyncedNarcotics).where(eq(unsyncedNarcotics.id, data.id));
    await db
      .update(status)
      .set({ value: sql`${status.value} + 1` })
      .where(eq(status.item, "narcotics_dispensed"));

    return { success: true };
  }
);
