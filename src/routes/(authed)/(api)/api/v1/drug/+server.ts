import { db } from "$lib/server/db/";
import { drugs } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { like, or } from "drizzle-orm";

export async function GET({ url }) {
  const query = url.searchParams.get("q");

  if (!query) return new Response(null, { status: 400, statusText: "Bad Request" });

  const fuzzyQuery =
    "%" + query.replaceAll(/[اأؤإيىئءوةه]/g, "_").replaceAll(" ", "%") + "%";

  const matches = await db
    .select()
    .from(drugs)
    .where(or(like(drugs.name_ar, fuzzyQuery), like(drugs.tradename_ar, fuzzyQuery)));

  return json(matches);
}
