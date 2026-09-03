import { query } from "$app/server";
import { db } from "$lib/server/db";
import { transactionTickets } from "$lib/server/db/schema";

export const getSystemFirstDate = query(async () => {
  return (
    (await db.select().from(transactionTickets).limit(1))?.[0].timestamp ?? new Date()
  );
});
