import { getRequestEvent, query } from "$app/server";
import { PUBLIC_store_id } from "$env/static/public";
import { db } from "$lib/server/db";
import { drugs, transactions, transactionTickets } from "$lib/server/db/schema";
import { and, eq, gte, isNotNull, lte, sum } from "drizzle-orm";
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
        amount: sum(transactions.qty),
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
      .orderBy(drugs.category);

    return totals;
  }
);
