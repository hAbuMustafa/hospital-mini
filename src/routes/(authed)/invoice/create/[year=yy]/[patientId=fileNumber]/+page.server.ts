import { formatDate } from "$lib/date/utils";
import { db } from "$lib/server/db/";
import { patients_view } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function load({ params, fetch }) {
  const patientId = [params.year, params.patientId].join("/");

  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  const staleData = await fetch(
    `/api/v1/patient/getStaleData?patient_id=${patient.id}&f=${formatDate(patient.admission_date)}&t=${formatDate(patient.discharge_date ?? new Date())}`,
  ).then((d) => d.json());

  return {
    patient,
    staleData,
  };
}
