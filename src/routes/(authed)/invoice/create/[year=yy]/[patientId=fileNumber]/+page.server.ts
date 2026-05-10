import { db } from "$lib/server/db/";
import { patientAdmissions } from "$lib/server/db/schema.js";
import { eq } from "drizzle-orm";

export async function load({ params }) {
  const patientId = [params.year, params.patientId].join("/");

  const [patient] = await db
    .select()
    .from(patientAdmissions)
    .where(eq(patientAdmissions.id, patientId));

  return {
    patient,
  };
}
