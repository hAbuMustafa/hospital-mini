import { db } from "$lib/server/db/";
import { patients_view } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ params }) {
  const patientId = [params.year, params.patientId].join("/");

  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  return {
    patient,
  };
}
