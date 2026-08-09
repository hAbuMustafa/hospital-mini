import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  real,
  int,
  sqliteView,
  numeric,
  integer,
  index,
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
  admission_notes: text(),
  gender: int({ mode: "boolean" }),
  birthdate: int({ mode: "timestamp" }),
  insured: int({ mode: "boolean" }),
  nationality: text().default("EG"),
  referred_from: text(),
});

export const patientTransfers = sqliteTable("patientTransfers", {
  id: int().primaryKey({ autoIncrement: true }),
  patient_id: text(),
  timestamp: int({ mode: "timestamp" }),
  to_ward: text(),
  is_admission: int({ mode: "boolean" }),
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
  timestamp: int({ mode: "timestamp" }).$defaultFn(() => new Date()),
  store_id: int().notNull(),
  user_id: text().notNull(),
  patient_id: text(),
  entity: text(), // if it is a transfer from or to an other entity (not a dispense/return to/from a patient)
  is_dispense: int({ mode: "boolean" }).notNull(), // `true` for sale, `false` for returns
  return_on_ticket_id: int(), // if it is a return ticket, insert its id
});

export const transactions = sqliteTable("transactions", {
  id: int().primaryKey({ autoIncrement: true }),
  item_id: int().notNull(),
  qty: int().notNull(),
  qty_returned: int(),
  unit_price: numeric({ mode: "number" }).notNull(),
  ticket_id: int().references(() => transactionTickets.id),
});

export const unsyncedNarcotics = sqliteTable("unsyncedNarcotics", {
  id: int().primaryKey({ autoIncrement: true }),
  ticket_id: int()
    .notNull()
    .references(() => transactionTickets.id, { onDelete: "cascade" }),
  ticket_timestamp: int({ mode: "timestamp" }).notNull(),
  patient_id: text().notNull(),
  item_name: text().notNull(),
  qty: int().notNull(),
});

export const department_group = sqliteTable("department_group", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  has_stock: int({ mode: "boolean" }),
  is_ward: int({ mode: "boolean" }),
});

export const departments = sqliteTable("departments", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text(),
  floor: int(),
  room_number: text(),
  department_group_id: int().references(() => department_group.id),
});

/*
 * VIEWS
 */

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
  nationality: text().notNull(),
  referred_from: text(),
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
  t.to_ward as ward_on_admission,
  r.to_ward as ward_recent,
  a.admission_notes,
  a.gender,
  a.birthdate,
  a.insured,
  a.nationality,
  a.referred_from
FROM patientAdmissions a
LEFT JOIN patientTransfers t ON a.id = t.patient_id AND t.is_admission = 1
LEFT JOIN patientDischarges d ON a.id = d.patient_id
LEFT JOIN recentWards_view r ON a.id = r.patient_id
`
);

/*
 * SPECIAL PURPOSE TABLES
 */

export const status = sqliteTable("status", {
  id: int().primaryKey({ autoIncrement: true }),
  item: text(),
  value: int(),
});

// Special table to bypass user phone-number update through OTP only
export const otp = sqliteTable("otp", {
  phoneNumber: text("phone-number").notNull().unique(),
  otp: text().notNull(),
});

/* AUTH SCHEMA */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  phoneNumber: text("phone_number").unique(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
  displayUsername: text("display_username"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  phoneNumberVerified: integer("phone_number_verified", { mode: "boolean" }),
  affiliation: int().references(() => departments.id),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
