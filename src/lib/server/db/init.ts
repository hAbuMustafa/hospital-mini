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
    console.error("Database initialization Error. No data could be fetched.");
    process.exit(1);
  }

  // 2. TRUNCATE Old data
  await db.delete(drugs);
  await db.delete(patientAdmissions);
  await db.delete(patientTransfers);
  await db.delete(patientDischarges);

  // 3. PARSE new data
  const seedableDrugs = fetchedDrugs.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "drug"));

  const seedableAdmissions = fetchedPatientAdmissions.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "admission"));

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

const drugsColumns = [
  "name_ar",
  "unit",
  "tradename_ar",
  "name",
  "price",
  "price_resale",
  "record_4_page",
  "stock_amount",
  "query_in_UPA_sheet",
  "occurrences_in_UPA_sheet",
  "category",
  "id",
  "record_2_page",
  "smc_code",
  "is_used",
  "tradename",
] as const;

const AdmissionsColumns = [
  "id",
  "name",
  "id_type",
  "id_number",
  "diagnosis",
  "admission_date",
  "discharge_date",
  "discharge_reason",
  "ward_recent",
  "ward_on_admission",
  "admission_notes",
  "ininininini",
  "gender",
  "birthdate",
  "insured",
] as const;

const TransfersColumns = ["patient_id", "patient_name", "timestamp", "to_ward"] as const;

const DischargesColumns = ["patient_id", "patient_name", "timestamp", "reason"] as const;

type ColumnList =
  | typeof drugsColumns
  | typeof AdmissionsColumns
  | typeof TransfersColumns
  | typeof DischargesColumns;

type SeedType = "admission" | "transfer" | "discharge" | "drug";

function sheetRowToObject(row: (string | number)[], type: SeedType) {
  let columnList: ColumnList;

  switch (type) {
    case "admission":
      columnList = AdmissionsColumns;
      break;
    case "transfer":
      columnList = TransfersColumns;
      break;
    case "discharge":
      columnList = DischargesColumns;
      break;

    default:
      columnList = drugsColumns;
      break;
  }

  const result: { [key: string]: string | number | Date } = {};

  for (let i = 0; i < row.length; i++) {
    if (row[i] !== "") {
      const fieldName = columnList[i];
      if (fieldName.includes("date")) {
        result[fieldName] = parseDate(row[i] as string);
      } else {
        result[fieldName] = row[i];
      }
    }
  }

  return result;
}

function parseDate(dateString: string) {
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString.trim())) return null;

  const [m, d, y] = dateString.split("/").map(Number);

  const date = new Date(y, m - 1, d);

  return date;
}
