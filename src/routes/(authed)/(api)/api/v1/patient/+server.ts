import { db } from "$lib/server/db/";
import { patients_view } from "$lib/server/db/schema";
import { like, eq, desc } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import { fuzzyQuery } from "$lib/server/db/utils.js";

export async function GET({ url }) {
  const patientQuery = url.searchParams.get("q");

  if (!patientQuery)
    return new Response(null, { status: 400, statusText: "Bad Request" });

  const queryType = /\p{Script=Arabic}/u.test(patientQuery)
    ? "name"
    : /^\d\d\/\d{1,5}$/.test(patientQuery)
      ? "file_id"
      : "id_number";

  let patientMatches: PatientT[];

  switch (queryType) {
    case "name":
      patientMatches = await db
        .select()
        .from(patients_view)
        .where(like(patients_view.name, fuzzyQuery(patientQuery)))
        .orderBy(desc(patients_view.admission_date));
      break;
    case "file_id":
      patientMatches = await db
        .select()
        .from(patients_view)
        .where(eq(patients_view.id, patientQuery))
        .orderBy(desc(patients_view.admission_date));
      break;
    default:
      patientMatches = await db
        .select()
        .from(patients_view)
        .where(like(patients_view.id, `${patientQuery}%`))
        .orderBy(desc(patients_view.admission_date));

      break;
  }

  return json(patientMatches);
}
