import {
  drugs_spreadsheetId,
  narcotics_spreadsheetId,
  patients_spreadsheetId,
} from "$env/static/private";
import { db } from "$lib/server/db";
import {
  drugs,
  narcoticsDispensed,
  patientAdmissions,
  patientDischarges,
  patientTransfers,
  status,
} from "$lib/server/db/schema";
import { getSheetRange, getSheetRanges } from "$lib/server/gcp/sheets";
import { sheetRowToObject } from "$lib/server/gcp/utils";

export async function initialize() {
  // 1. FETCH
  const fetchedPatient = await getSheetRanges(patients_spreadsheetId, [
    "Admissions!C:T",
    "Transfers!B:E",
    "Discharges!B:E",
  ]);

  const fetchedNarcoticsDispensed = await getSheetRange(
    narcotics_spreadsheetId,
    "Dispensed!A:E"
  );

  const fetchedDrugs = await getSheetRange(drugs_spreadsheetId, "الأدوية!A:P");

  if (
    !fetchedPatient.Admissions.values ||
    !fetchedPatient.Transfers.values ||
    !fetchedPatient.Discharges.values ||
    !fetchedNarcoticsDispensed.values ||
    !fetchedDrugs.values
  ) {
    console.error("⚠️⏬ Database initialization Error. No data could be fetched.");
    process.exit(1);
  }

  // 2. TRUNCATE Old data
  await db.delete(drugs);
  await db.delete(patientAdmissions);
  await db.delete(patientTransfers);
  await db.delete(patientDischarges);
  await db.delete(narcoticsDispensed);
  await db.delete(status);

  // 3. PARSE new data
  const seedableDrugs = fetchedDrugs.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "drug"));

  const seedableAdmissions = fetchedPatient.Admissions.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "admission"));

  const seedableDischarges = fetchedPatient.Discharges.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "discharge"));

  const seedableTransfers = fetchedPatient.Transfers.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "transfer"));

  const seedableNarcoticsDispensed = fetchedNarcoticsDispensed.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "narcotic_dispense"));

  // 4. INSERT New data
  try {
    await db.insert(drugs).values(seedableDrugs);

    for (const admission of seedableAdmissions) {
      await db.transaction(async (tx) => {
        await tx.insert(patientTransfers).values({
          patient_id: admission.id as string,
          timestamp: admission.admission_date as Date,
          to_ward: admission.ward_on_admission as string,
          is_admission: true,
        });

        await tx
          .insert(patientAdmissions)
          .values(admission as unknown as typeof patientAdmissions.$inferInsert);
      });
    }

    for (const transfer of seedableTransfers) {
      await db.insert(patientTransfers).values(transfer);
    }

    for (const discharge of seedableDischarges) {
      await db.insert(patientDischarges).values(discharge);
    }

    for (const narcoticDispense of seedableNarcoticsDispensed) {
      await db.insert(narcoticsDispensed).values(narcoticDispense);
    }
  } catch (e) {
    console.error("INSERT FAILED::", e);
  }

  await db.insert(status).values([
    { item: "admissions", value: fetchedPatient.Admissions.values.length },
    { item: "transfers", value: fetchedPatient.Transfers.values.length },
    { item: "discharges", value: fetchedPatient.Discharges.values.length },
    { item: "narcotics_dispensed", value: fetchedNarcoticsDispensed.values.length },
  ]);
}
