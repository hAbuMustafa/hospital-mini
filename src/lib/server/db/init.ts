import { drugs_spreadsheetId, patients_spreadsheetId } from "$env/static/private";
import { db } from "$lib/server/db";
import {
  drugs,
  patientAdmissions,
  patientDischarges,
  patientTransfers,
  status,
} from "$lib/server/db/schema";
import { getSheetRange } from "$lib/server/gcp/sheets";
import { sheetRowToObject } from "$lib/server/gcp/utils";

export async function initialize() {
  // 1. FETCH
  const fetchedPatientAdmissions = await getSheetRange(
    patients_spreadsheetId,
    "Admissions!C:Q",
  );
  const fetchedPatientTransfers = await getSheetRange(
    patients_spreadsheetId,
    "Transfers!B:E",
  );
  const fetchedPatientDischarges = await getSheetRange(
    patients_spreadsheetId,
    "Discharges!B:E",
  );

  const fetchedDrugs = await getSheetRange(drugs_spreadsheetId, "الأدوية!A:P");

  if (
    !fetchedPatientAdmissions.values ||
    !fetchedPatientTransfers.values ||
    !fetchedPatientDischarges.values ||
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
  await db.delete(status);

  // 3. PARSE new data
  const seedableDrugs = fetchedDrugs.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "drug"));

  const seedableAdmissions = fetchedPatientAdmissions.values
    .slice(1)
    .map((item) =>
      sheetRowToObject(item, "admission"),
    ) as unknown as typeof patientAdmissions.$inferInsert;

  const seedableDischarges = fetchedPatientDischarges.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "discharge"));

  const seedableTransfers = fetchedPatientTransfers.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "transfer"));

  // 4. INSERT New data
  await db.insert(drugs).values(seedableDrugs);
  await db.insert(patientAdmissions).values(seedableAdmissions);
  await db.insert(patientTransfers).values(seedableTransfers);
  await db.insert(patientDischarges).values(seedableDischarges);

  await db.insert(status).values([
    { item: "admissions", value: fetchedPatientAdmissions.values.length },
    { item: "transfers", value: fetchedPatientTransfers.values.length },
    { item: "discharges", value: fetchedPatientDischarges.values.length },
  ]);
}
