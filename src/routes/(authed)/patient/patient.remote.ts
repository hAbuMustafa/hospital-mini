import { query } from "$app/server";
import { db } from "$lib/server/db";
import { patients_view } from "$lib/server/db/schema";
import { isNull } from "drizzle-orm";

export const getPatientsByWard = query(async () => {
  const currentInpatient = await db
    .select()
    .from(patients_view)
    .where(isNull(patients_view.discharge_date));

  return Object.groupBy(currentInpatient, (p) => (p.ward_recent || p.ward_on_admission)!);
});
