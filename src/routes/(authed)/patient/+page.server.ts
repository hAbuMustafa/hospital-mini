import { db } from "$lib/server/db";
import { patients_view } from "$lib/server/db/schema";
import { isNull } from "drizzle-orm";

export async function load() {
  const currentInpatient = await db
    .select()
    .from(patients_view)
    .where(isNull(patients_view.discharge_date));

  return {
    patients: currentInpatient,
  };
}
