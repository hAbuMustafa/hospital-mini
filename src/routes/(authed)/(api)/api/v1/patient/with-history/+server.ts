import { db } from "$lib/server/db";
import { patientAdmissions, patients_view } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function GET({ url }) {
  const patientId = url.searchParams.get("id");

  if (!patientId) return new Response(null, { status: 400, statusText: "Bad Request" });

  const [patient] = await db
    .select()
    .from(patientAdmissions)
    .where(eq(patientAdmissions.id, patientId));

  if (!patient) return json({ admissions: [] });

  if (!patient.id_number) return json({ admissions: [patient] });

  const allTheirAdmissions = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id_number, patient.id_number));

  return json({
    admissions: allTheirAdmissions,
  });
}
