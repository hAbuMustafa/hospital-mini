import { drugs, transactions, transactionTickets } from "$lib/server/db/schema";
import { type SQL, sql } from "drizzle-orm";

export function totalAndAmount(withTotal = true) {
  const result: { amount: SQL<number>; total?: SQL<number> } = {
    amount: sql<number>`
      SUM(
        CASE 
          WHEN ${transactionTickets.is_dispense} = false THEN -${transactions.qty}
          ELSE ${transactions.qty}
        END
      )`,
  };

  if (withTotal) {
    result.total = sql<number>`
      SUM(
        CASE 
          WHEN ${transactionTickets.is_dispense} = false THEN -${transactions.qty}
          ELSE ${transactions.qty}
        END
      ) * ${drugs.price_resale}`;
  }

  return result;
}
