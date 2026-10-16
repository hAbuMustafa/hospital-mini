import { query } from "$app/server";
import { db } from "$lib/server/db";
import { drugs, patients_view } from "$lib/server/db/schema";
import { fuzzyQuery } from "$lib/server/db/utils";
import { desc, eq, like, or, sql } from "drizzle-orm";
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
