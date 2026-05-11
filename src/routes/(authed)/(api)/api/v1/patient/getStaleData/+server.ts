import { formatDate, setToEndOfDay } from "$lib/date/utils";
import { db } from "$lib/server/db/";
import {
  narcoticsDispensed,
  patients_view,
  patientTransfers,
} from "$lib/server/db/schema.js";
import { json } from "@sveltejs/kit";
import dayjs from "dayjs";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export async function GET({ url }) {
  const patient_id = url.searchParams.get("patient_id");
  const fromString = url.searchParams.get("f");
  const toString = url.searchParams.get("t");

  if (!patient_id || !fromString || !toString)
    return new Response(null, { status: 400, statusText: "Bad Request" });

  const from = dayjs(fromString).toDate();
  const to = dayjs(toString).toDate();

  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patient_id));

  const [periodWard] =
    fromString === formatDate(patient.admission_date)
      ? [null]
      : await db
          .select()
          .from(patientTransfers)
          .where(
            and(
              eq(patientTransfers.patient_id, patient_id),
              lte(patientTransfers.timestamp, from),
            ),
          )
          .orderBy(desc(patientTransfers.id))
          .limit(1);

  setToEndOfDay(to);
  to.setDate(to.getDate() + 1); // +1 offset as a days dispensed registration often happens next day

  const narcotics = await db
    .select()
    .from(narcoticsDispensed)
    .where(
      and(
        eq(narcoticsDispensed.patient_id, patient_id),
        gte(narcoticsDispensed.timestamp, from),
        lte(narcoticsDispensed.timestamp, to),
      ),
    );

  return json({
    ward: periodWard?.to_ward ?? patient.ward_on_admission,
    narcotics,
  });
}
