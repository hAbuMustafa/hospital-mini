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

export const patients = sqliteTable("patients", {
  id: text().primaryKey(),
  name: text(),
  id_type: text(),
  id_number: text(),
  diagnosis: text(),
  admission_date: text(),
  discharge_date: text(),
  discharge_reason: text(),
  ward_recent: text(),
  ward_on_admission: text(),
  admission_notes: text(),
  ininininini: text(), // placeholder for seeding of form submitted "is insured"
  gender: int(),
  birthdate: text(),
  insured: int(),
});
