import { getRequestEvent, query } from "$app/server";
import { formatDate } from "$lib/date/utils";
import { db } from "$lib/server/db";
import {
  drugs,
  stockDrugs,
  transactions,
  transactionTickets,
} from "$lib/server/db/schema";
import { and, between, count, desc, eq, gt, isNotNull } from "drizzle-orm";
import * as v from "valibot";

export const getTopPicks = query(v.number(), async (n) => {
  const currentUser = getRequestEvent().locals.user!;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  try {
    return await db
      .select()
      .from(transactions)
      .leftJoin(drugs, eq(transactions.item_id, drugs.id))
      .leftJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
      .leftJoin(stockDrugs, eq(drugs.id, stockDrugs.drug_id))
      .where(
        and(
          currentUser.role === "admin"
            ? isNotNull(transactions.id)
            : eq(stockDrugs.pharmacy_id, currentUser.affiliation),
          gt(transactions.qty, 0),
          between(transactionTickets.timestamp, sevenDaysAgo, now)
        )
      )
      .groupBy(drugs.id)
      .orderBy(desc(count(drugs.id)))
      .limit(n);
  } catch (err) {
    console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), err);
  }
});
