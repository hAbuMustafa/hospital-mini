import type { patients_view } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";

type patientHistory = {
  admissions: (typeof patients_view.$inferSelect)[];
};

export async function load({ params, fetch }) {
  const file_id = `${params.year}/${params.patientId}`;

  const patientHistory: patientHistory = await fetch(
    "/api/v1/patient/with-history?id=" + file_id,
  ).then((d) => d.json());

  if (!patientHistory.admissions.length) return error(404, "المريض غير موجود");

  const patient = patientHistory.admissions.find((p) => p.id === file_id)!;

  const otherAdmissions = patientHistory.admissions.filter((p) => p.id !== file_id);

  return {
    patient,
    otherAdmissions,
  };
}
