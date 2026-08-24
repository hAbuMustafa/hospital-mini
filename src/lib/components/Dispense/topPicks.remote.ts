import { query } from "$app/server";
import { db } from "$lib/server/db";
import { drugs, transactions, transactionTickets } from "$lib/server/db/schema";
import { and, between, count, desc, eq, gt } from "drizzle-orm";
import * as v from "valibot";

export const getTopPicks = query(v.number(), async (n) => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  try {
    return await db
      .select()
      .from(transactions)
      .leftJoin(drugs, eq(transactions.item_id, drugs.id))
      .leftJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
      .where(
        and(
          gt(transactions.qty, 0),
          between(transactionTickets.timestamp, sevenDaysAgo, now)
        )
      )
      .groupBy(drugs.id)
      .orderBy(desc(count(drugs.id)))
      .limit(n);
  } catch (err) {
    console.error(err);
  }
});
