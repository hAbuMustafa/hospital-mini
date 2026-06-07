import { db } from "$lib/server/db/";
import { drugs } from "$lib/server/db/schema";
import { fuzzyQuery as fuzzy } from "$lib/server/db/utils";
import { json } from "@sveltejs/kit";
import { like, or, sql } from "drizzle-orm";

export async function GET({ url }) {
  const query = url.searchParams.get("q");

  if (!query) return new Response(null, { status: 400, statusText: "Bad Request" });

  const fuzzyQuery = fuzzy(query);

  const matches = await db
    .select()
    .from(drugs)
    .where(
      or(
        sql`${drugs.name_ar} LIKE ${fuzzyQuery} ESCAPE '\\'`,
        sql`${drugs.name} LIKE ${fuzzyQuery} ESCAPE '\\'`,
        sql`${drugs.tradename_ar} LIKE ${fuzzyQuery} ESCAPE '\\'`,
        sql`${drugs.tradename} LIKE ${fuzzyQuery} ESCAPE '\\'`,
      ),
    );

  return json(matches);
}
