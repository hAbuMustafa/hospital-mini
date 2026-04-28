import {
  drugs_spreadsheetId,
  patients_spreadsheetId,
} from "$env/static/private";
import { db } from "$lib/server/db";
import { drugs, patients } from "$lib/server/db/schema";
import { getSheetRange } from "$lib/server/gcp/sheets";

export async function initialize() {
  // 1. FETCH
  const fetchedPatients = await getSheetRange(
    patients_spreadsheetId,
    "Admissions!C:Q",
  );
  const fetchedDrugs = await getSheetRange(drugs_spreadsheetId, "الأدوية!A:P");

  if (!fetchedPatients || !fetchedDrugs) {
    console.error("Database initialitzation Error. No data could be fetched.");
    process.exit(1);
  }

  // 2. TRUNCATE Old data
  await db.delete(drugs);
  await db.delete(patients);

  // 3. INSERT New data
  const seedableDrugs = fetchedDrugs.values.slice(1);
  const seedablePatients = fetchedPatients.values.slice(1);

  for (let i = 0; i < seedableDrugs.length; i++) {
    await db.insert(drugs).values(sheetRowToObject(seedableDrugs[i], "drug"));
  }

  for (let i = 0; i < seedablePatients.length; i++) {
    await db
      .insert(patients)
      .values(sheetRowToObject(seedablePatients[i], "patient"));
  }
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
  "occurences_in_UPA_sheet",
  "category",
  "id",
  "record_2_page",
  "smc_code",
  "is_used",
  "tradename",
] as const;

const patientsColumns = [
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

function sheetRowToObject(row: (string | number)[], type: "patient" | "drug") {
  let columnList: typeof drugsColumns | typeof patientsColumns;
  if (type === "patient") {
    columnList = patientsColumns;
  } else {
    columnList = drugsColumns;
  }

  const result = {};

  for (let i = 0; i < row.length; i++) {
    if (row[i] !== "") {
      result[columnList[i]] = row[i];
    }
  }

  return result;
}
