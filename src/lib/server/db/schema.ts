import { sqliteTable, text, real, int } from "drizzle-orm/sqlite-core";

export const drugs = sqliteTable("drugs", {
  name_ar: text(),
  unit: text(),
  tradename_ar: text(),
  name: text(),
  price: real(),
  price_resale: real(),
  record_4_page: int(),
  stock_amount: int(),
  query_in_UPA_sheet: text(),
  occurences_in_UPA_sheet: int(),
  category: text(),
  id: int().primaryKey(),
  record_2_page: int(),
  smc_code: int(),
  is_used: text(),
  tradename: text(),
});

export const patientAdmissions = sqliteTable("patientAdmissions", {
  id: text().primaryKey(),
  name: text(),
  id_type: text(),
  id_number: text(),
  diagnosis: text(),
  admission_date: int({ mode: "timestamp" }),
  discharge_reason: text(),
  ward_on_admission: text(),
  admission_notes: text(),
  gender: int({ mode: "boolean" }),
  birthdate: int({ mode: "timestamp" }),
  insured: int({ mode: "boolean" }),
});

export const patientTransfers = sqliteTable("patientTransfers", {
  id: int().primaryKey({ autoIncrement: true }),
  patient_id: text(),
  timestamp: int({ mode: "timestamp" }),
  to_ward: text(),
});

export const patientDischarges = sqliteTable("patientDischarges", {
  patient_id: text(),
  timestamp: int({ mode: "timestamp" }),
  reason: text(),
});

export const status = sqliteTable("status", {
  id: int().primaryKey({ autoIncrement: true }),
  item: text(),
  value: int(),
});
