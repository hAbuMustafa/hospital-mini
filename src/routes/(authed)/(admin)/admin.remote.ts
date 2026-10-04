import { form, query } from "$app/server";
import {
  drugs_spreadsheetId,
  narcotics_spreadsheetId,
  patients_spreadsheetId,
} from "$env/static/private";
import { db } from "$lib/server/db";
import {
  drugs,
  patientAdmissions,
  patientDischarges,
  patientTransfers,
  status,
  transactions,
  transactionTickets,
  departments,
  user,
} from "$lib/server/db/schema";
import { getSheetRange, getSheetRanges } from "$lib/server/gcp/sheets";
import {
  admissionRowToObject,
  transferRowToObject,
  dischargeRowToObject,
  drugRowToObject,
  narcoticDispenseRowToObject,
} from "$lib/server/gcp/utils";
import { eq, ne, sql } from "drizzle-orm";
import { reportSheetFetch, reportSheetMultiFetch } from "$lib/server/db/utils";
import { formatDate, getDuration, getTermed } from "$lib/date/utils";
import * as v from "valibot";
import { invalid } from "@sveltejs/kit";

export const getDepartments = query(async () => {
  return await db.select().from(departments);
});

export const getUsers = query(async () => {
  return await db.select().from(user);
});

const departmentsIds = await db
  .select()
  .from(departments)
  .then((deps) => deps.map((dep) => String(dep.id)));

export const changeAffiliation = form(
  v.object({
    userId: v.string(),
    departmentId: v.picklist(departmentsIds),
  }),
  async (data) => {
    await db
      .update(user)
      .set({ affiliation: Number(data.departmentId) })
      .where(eq(user.id, data.userId));
    return { success: true };
  }
);

export const changeRole = form(
  v.object({
    userId: v.string(),
    role: v.string(),
  }),
  async (data) => {
    try {
      await db.update(user).set({ role: data.role }).where(eq(user.id, data.userId));

      return { success: true };
    } catch (err) {
      console.error(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), err);
      return {
        error: err,
      };
    }
  }
);

export const setSystemFirstDay = form(v.object({ date: v.string() }), async (data) => {
  await db
    .insert(status)
    .values({ item: "first_date", value_timestamp: new Date(data.date) })
    .onConflictDoUpdate({
      target: status.item,
      set: {
        value_timestamp: sql`excluded.value_timestamp`,
      },
    });
});

export const startSeed = form(
  v.object({
    a: v.optional(v.string()),
  }),
  async () => {
    // 0. Check if can fetch?
    const canFetch = await getSheetRange(patients_spreadsheetId, "Changelog!E1");

    if (canFetch.values?.[0]?.[0]?.toUpperCase() !== "TRUE") {
      invalid("لا يمكن تحديث البيانات الآن.");
    }

    const startTime = new Date();

    console.log(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), "🌱 Seeding Started!");

    console.time("💠 Seeding");

    // 1. FETCH
    const fetchedPatient = await getSheetRanges(patients_spreadsheetId, [
      "Admissions!C:T",
      "Transfers!B:E",
      "Discharges!B:E",
      "Changelog!A:A",
    ]);

    reportSheetMultiFetch(fetchedPatient);

    const fetchedNarcoticsDispensed = await getSheetRange(
      narcotics_spreadsheetId,
      "Dispensed!A:E"
    );

    reportSheetFetch(fetchedNarcoticsDispensed);

    const fetchedDrugs = await getSheetRange(drugs_spreadsheetId, "الأدوية!A:P");

    reportSheetFetch(fetchedDrugs);

    if (
      !fetchedPatient.Admissions.values ||
      !fetchedPatient.Transfers.values ||
      !fetchedPatient.Discharges.values ||
      !fetchedPatient.Changelog.values ||
      !fetchedNarcoticsDispensed.values ||
      !fetchedDrugs.values
    ) {
      console.error(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "⚠️⏬ Database initialization Error. No data could be fetched."
      );
      process.exit(1);
    }

    // 2. TRUNCATE Old data
    await db.delete(drugs);
    await db.delete(patientAdmissions);
    await db.delete(patientTransfers);
    await db.delete(patientDischarges);
    await db.delete(transactionTickets).where(eq(transactionTickets.user_id, ""));
    await db.update(status).set({ value: 0 }).where(ne(status.item, "first_date"));

    // reset sequences
    await db.run("UPDATE sqlite_sequence set seq = 0 where name = 'patientTransfers'");

    console.info(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "🧹 Tables Truncated Successfully"
    );

    // 3. PARSE new data
    const seedableDrugs = fetchedDrugs.values
      .slice(1)
      .map((item) => drugRowToObject(item));

    const seedableAdmissions = fetchedPatient.Admissions.values
      .slice(1)
      .map((item) => admissionRowToObject(item));

    const seedableDischarges = fetchedPatient.Discharges.values
      .slice(1)
      .map((item) => dischargeRowToObject(item));

    const seedableTransfers = fetchedPatient.Transfers.values
      .slice(1)
      .map((item) => transferRowToObject(item));

    const seedableNarcoticsDispensed = fetchedNarcoticsDispensed.values
      .slice(1)
      .map((item) => narcoticDispenseRowToObject(item));

    console.info(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), "🧮 Processed values");

    // 4. INSERT New data
    try {
      await db.insert(drugs).values(seedableDrugs);

      console.info(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "💊✔️ Drugs Inserted Successfully"
      );

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

      console.info(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "🏥✔️ Admissions Inserted Successfully"
      );

      for (const transfer of seedableTransfers) {
        await db.insert(patientTransfers).values(transfer);
      }

      console.info(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "🛌🏻✔️ Ward Transfers Inserted Successfully"
      );

      for (const discharge of seedableDischarges) {
        await db.insert(patientDischarges).values(discharge);
      }

      console.info(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "👋🏻✔️ Patient Discharges Inserted Successfully"
      );

      for (const narcoticDispense of seedableNarcoticsDispensed) {
        await db.transaction(async (tx) => {
          const [dispTicket] = await tx
            .insert(transactionTickets)
            .values({
              timestamp: narcoticDispense.timestamp,
              patient_id: narcoticDispense.patient_id,
              store_id: 1,
              user_id: "",
              is_dispense: true,
            })
            .returning();

          await tx.insert(transactions).values({
            ticket_id: dispTicket.id,
            item_id: narcoticDispense.item_id,
            qty: narcoticDispense.qty,
            unit_price: narcoticDispense.unit_price,
          });
        });
      }

      console.info(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "⚕️✔️ Dispensed Narcotics Replaced Successfully"
      );
    } catch (e) {
      console.error(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        "INSERT FAILED::",
        e
      );
    }

    // 5. UPDATE status numbers
    await db
      .insert(status)
      .values([
        { item: "admissions", value: fetchedPatient.Admissions.values.length },
        { item: "transfers", value: fetchedPatient.Transfers.values.length },
        { item: "discharges", value: fetchedPatient.Discharges.values.length },
        { item: "updates", value: fetchedPatient.Changelog.values.length },
        { item: "narcotics_dispensed", value: fetchedNarcoticsDispensed.values.length },
        { item: "last_patient_fetch", value_timestamp: new Date() },
        { item: "last_drug_fetch", value_timestamp: new Date() },
      ])
      .onConflictDoUpdate({
        target: status.item,
        set: {
          value: sql`excluded.value`,
          value_timestamp: sql`excluded.value_timestamp`,
        },
      });

    console.timeEnd("💠 Seeding");

    const duration = getDuration(startTime, new Date(), "minutes");

    return `تمت التغذية بنجاح في ${getTermed(Math.floor(duration), "دقيقة", "دقائق")} و ${getTermed((duration % 1) * 60, "ثانية", "ثوان")}`;
  }
);
