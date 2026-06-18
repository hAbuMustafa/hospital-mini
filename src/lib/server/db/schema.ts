import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  real,
  int,
  sqliteView,
  numeric,
} from "drizzle-orm/sqlite-core";

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
  occurrences_in_UPA_sheet: int(),
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

export const narcoticsDispensed = sqliteTable("narcoticsDispensed", {
  id: int().primaryKey({ autoIncrement: true }),
  timestamp: int({ mode: "timestamp" }),
  patient_id: text(),
  item_id: int(),
  amount: int(),
});

export const stores = sqliteTable("stores", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text(),
});

export const transactionTickets = sqliteTable("transactionTickets", {
  id: int().primaryKey({ autoIncrement: true }),
  timestamp: int({ mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  store_id: int().notNull(),
  user_id: int().notNull(),
  patient_id: text(),
  entity: text(),
  type: int({ mode: "boolean" }), // `true` for sale, `false` for returns
});

export const transactions = sqliteTable("transactions", {
  id: int().primaryKey({ autoIncrement: true }),
  item_id: int().notNull(),
  qty: int().notNull(),
  unit_price: numeric().notNull(),
});

export const recentWards_view = sqliteView("recentWards_view", {
  id: int(),
  patient_id: text(),
  timestamp: int({ mode: "timestamp" }),
  to_ward: text(),
}).as(
  sql`
SELECT
  MAX(id) as id,
  patient_id,
  timestamp,
  to_ward
FROM patientTransfers
GROUP BY patient_id
`
);

export const patients_view = sqliteView("patients_view", {
  id: text().primaryKey(),
  name: text(),
  id_type: text(),
  id_number: text(),
  diagnosis: text(),
  admission_date: int({ mode: "timestamp" }).notNull(),
  discharge_date: int({ mode: "timestamp" }),
  discharge_reason: text(),
  ward_on_admission: text(),
  ward_recent: text(),
  admission_notes: text(),
  gender: int({ mode: "boolean" }),
  birthdate: int({ mode: "timestamp" }),
  insured: int({ mode: "boolean" }),
}).as(
  sql`
SELECT 
  a.id,
  a.name,
  a.id_type,
  a.id_number,
  a.diagnosis,
  a.admission_date,
  d.timestamp as discharge_date,
  d.reason as discharge_reason,
  a.ward_on_admission,
  t.to_ward as ward_recent,
  a.admission_notes,
  a.gender,
  a.birthdate,
  a.insured
FROM patientAdmissions a
LEFT JOIN patientDischarges d ON a.id = d.patient_id
LEFT JOIN recentWards_view t ON a.id = t.patient_id
`
);

export const status = sqliteTable("status", {
  id: int().primaryKey({ autoIncrement: true }),
  item: text(),
  value: int(),
});
