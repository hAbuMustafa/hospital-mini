import { query } from "$app/server";
import { db } from "$lib/server/db";
import {
  patientAdmissions,
  patients_view,
  patientTransfers,
} from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { and, desc, eq, ne } from "drizzle-orm";
import * as v from "valibot";

export const getPatientData = query(v.string(), async (patientId) => {
  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  if (!patient) return error(404, { message: "المريض غير موجود" });

  return patient;
});

export const getPatientTransfers = query(v.string(), async (patientId) => {
  const transfers = await db
    .select()
    .from(patientTransfers)
    .where(eq(patientTransfers.patient_id, patientId));

  return transfers;
});

export const getOtherAdmissions = query(
  v.object({ patientId: v.string(), patientIdDocNumber: v.string() }),
  async ({ patientId, patientIdDocNumber }) => {
    const otherAdmissions = await db
      .select()
      .from(patients_view)
      .where(
        and(
          eq(patients_view.id_number, patientIdDocNumber),
          ne(patients_view.id, patientId)
        )
      )
      .orderBy(desc(patients_view.admission_date));

    return otherAdmissions;
  }
);
