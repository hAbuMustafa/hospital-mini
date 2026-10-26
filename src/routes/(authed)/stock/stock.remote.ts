import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { departments, drugs, stockDrugs } from "$lib/server/db/schema";
import { eq, isNotNull } from "drizzle-orm";

export const getPharmacyStock = query(async () => {
  const currentUser = getRequestEvent().locals.user!;

  return await db
    .select({
      stock_id: stockDrugs.id,
      pharmacy_id: departments.id,
      pharmacy_name: departments.name,
      id: drugs.id,
      name: drugs.name_ar,
      tradename: drugs.tradename_ar,
      category: drugs.category,
      qty: stockDrugs.qty,
      batch_number: stockDrugs.batch_number,
      expiry_date: stockDrugs.expiry_date,
    })
    .from(drugs)
    .leftJoin(stockDrugs, eq(drugs.id, stockDrugs.drug_id))
    .leftJoin(departments, eq(stockDrugs.pharmacy_id, departments.id))
    .where(
      currentUser.role === "admin"
        ? isNotNull(drugs.id)
        : eq(stockDrugs.pharmacy_id, currentUser.affiliation)
    )
    .orderBy((t) => [t.category, t.id]);
});
