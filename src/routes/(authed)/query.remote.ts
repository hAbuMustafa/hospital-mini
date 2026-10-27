import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { drugs, patients_view, stockDrugs } from "$lib/server/db/schema";
import { fuzzyQuery } from "$lib/server/db/utils";
import {
  and,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  isNull,
  like,
  or,
  sql,
} from "drizzle-orm";
import * as v from "valibot";

export const queryPatient = query(v.string(), async (query) => {
  const queryType = /\p{Script=Arabic}/u.test(query)
    ? "name"
    : /^\d\d\/\d{1,5}$/.test(query)
      ? "file_id"
      : "id_number";

  return await db
    .select()
    .from(patients_view)
    .where(
      queryType === "name"
        ? like(patients_view.name, fuzzyQuery(query))
        : queryType === "file_id"
          ? eq(patients_view.id, query)
          : like(patients_view.id_number, `${query}%`)
    )
    .orderBy(desc(patients_view.admission_date));
});

export const queryDrug = query(v.string(), async (query) => {
  const fuzzy = fuzzyQuery(query);

  return await db
    .select()
    .from(drugs)
    .where(
      or(
        sql`${drugs.name_ar} LIKE ${fuzzy} ESCAPE '\\'`,
        sql`${drugs.name} LIKE ${fuzzy} ESCAPE '\\'`,
        sql`${drugs.tradename_ar} LIKE ${fuzzy} ESCAPE '\\'`,
        sql`${drugs.tradename} LIKE ${fuzzy} ESCAPE '\\'`
      )
    );
});

export const queryDrugFromStock = query(v.string(), async (query) => {
  const currentUser = getRequestEvent().locals.user!;

  const fuzzy = fuzzyQuery(query);

  return await db
    .select({
      ...getTableColumns(drugs),
      qty: stockDrugs.qty,
    })
    .from(drugs)
    .leftJoin(stockDrugs, eq(drugs.id, stockDrugs.drug_id))
    .where(
      and(
        currentUser.role === "admin"
          ? isNotNull(drugs.id)
          : or(
              eq(stockDrugs.pharmacy_id, currentUser.affiliation),
              isNull(stockDrugs.pharmacy_id)
            ),
        or(
          sql`${drugs.name_ar} LIKE ${fuzzy} ESCAPE '\\'`,
          sql`${drugs.name} LIKE ${fuzzy} ESCAPE '\\'`,
          sql`${drugs.tradename_ar} LIKE ${fuzzy} ESCAPE '\\'`,
          sql`${drugs.tradename} LIKE ${fuzzy} ESCAPE '\\'`
        )
      )
    );
});
