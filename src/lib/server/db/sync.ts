import {
  drugs_spreadsheetId,
  narcotics_spreadsheetId,
  patients_spreadsheetId,
} from "$env/static/private";
import { db } from "$lib/server/db";
import { getSheetRange, getSheetRanges } from "$lib/server/gcp/sheets";
import {
  drugs,
  patientAdmissions,
  patientDischarges,
  patientTransfers,
  status,
  transactions,
  transactionTickets,
} from "$lib/server/db/schema";
import {
  admissionRowToObject,
  transferRowToObject,
  dischargeRowToObject,
  drugRowToObject,
  narcoticDispenseRowToObject,
} from "$lib/server/gcp/utils";
import { eq, sql } from "drizzle-orm";
import { reportSheetMultiFetch, reportSheetFetch } from "./utils";
import { formatDate } from "$lib/date/utils";

export async function syncPatients() {
  // 1. Get your numbers ready
  const latestRows = await db
    .select({ item: status.item, value: status.value })
    .from(status);

  const latestAdmissionCount = latestRows.find((r) => r.item === "admissions")?.value;
  const latestTransferCount = latestRows.find((r) => r.item === "transfers")?.value;
  const latestDischargeCount = latestRows.find((r) => r.item === "discharges")?.value;
  const latestNarcoticsDispensedCount = latestRows.find(
    (r) => r.item === "narcotics_dispensed"
  )?.value;
  const latestUpdatesCount = latestRows.find((r) => r.item === "updates")?.value ?? 0;

  if (
    !latestAdmissionCount ||
    !latestTransferCount ||
    !latestDischargeCount ||
    !latestNarcoticsDispensedCount
  ) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "⚠️ DATABASE is out of sync. Probably not initialized."
    );
    for (const { item, value } of latestRows) {
      console.info(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), item + ":", value);
    }
    return;
  }

  // 2. FETCH Only what you need
  const fetchedPatientsData = await getSheetRanges(patients_spreadsheetId, [
    `Admissions!C${latestAdmissionCount + 1}:T`,
    `Transfers!B${latestTransferCount + 1}:E`,
    `Discharges!B${latestDischargeCount + 1}:E`,
    `Changelog!B${latestUpdatesCount + 1}:A`,
  ]);

  reportSheetMultiFetch(fetchedPatientsData);

  const fetchedNarcoticsDispensed = await getSheetRange(
    narcotics_spreadsheetId,
    `Dispensed!A${latestNarcoticsDispensedCount + 1}:E`
  );

  reportSheetFetch(fetchedNarcoticsDispensed);

  // 3. PARSE AND INSERT new data
  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Admissions.values) {
      const seedableAdmissions = fetchedPatientsData.Admissions.values.map((item) =>
        admissionRowToObject(item)
      ) as unknown as (typeof patientAdmissions.$inferInsert & {
        ward_on_admission: string;
      })[];

      await tx.transaction(async (tx2) => {
        await tx2.insert(patientTransfers).values(
          seedableAdmissions.map((p) => ({
            patient_id: p.id,
            timestamp: p.admission_date,
            to_ward: p.ward_on_admission,
            is_admission: true,
          }))
        );
        await tx2.insert(patientAdmissions).values(seedableAdmissions);
      });

      const [newCount] = await tx
        .update(status)
        .set({
          value: latestAdmissionCount + fetchedPatientsData.Admissions.values.length,
        })
        .where(eq(status.item, "admissions"))
        .returning();

      console.log(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        `♻️✔️ Synced ${fetchedPatientsData.Admissions.values.length} Admissions. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Transfers.values) {
      const seedableTransfers = fetchedPatientsData.Transfers.values.map((item) =>
        transferRowToObject(item)
      );

      await tx.insert(patientTransfers).values(seedableTransfers);

      const [newCount] = await tx
        .update(status)
        .set({ value: latestTransferCount + fetchedPatientsData.Transfers.values.length })
        .where(eq(status.item, "transfers"))
        .returning();

      console.log(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        `♻️✔️ Synced ${fetchedPatientsData.Transfers.values.length} Transfers. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Discharges.values) {
      const seedableDischarges = fetchedPatientsData.Discharges.values.map((item) =>
        dischargeRowToObject(item)
      );

      await tx.insert(patientDischarges).values(seedableDischarges);

      const [newCount] = await tx
        .update(status)
        .set({
          value: latestDischargeCount + fetchedPatientsData.Discharges.values.length,
        })
        .where(eq(status.item, "discharges"))
        .returning();

      console.log(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        `♻️✔️ Synced ${fetchedPatientsData.Discharges.values.length} Discharges. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Changelog.values) {
      for (const update of fetchedPatientsData.Changelog.values) {
        try {
          await tx.run(update[0]);
        } catch (err) {
          console.error("Error in EXECUTING IMPORTED UPDATES\n", update[0], "\n", err);
        }
      }

      const [newCount] = await tx
        .update(status)
        .set({
          value: latestUpdatesCount + fetchedPatientsData.Changelog.values.length,
        })
        .where(eq(status.item, "updates"))
        .returning();

      console.log(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        `♻️✔️ Synced ${fetchedPatientsData.Changelog.values.length} IMPORTED UPDATES. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedNarcoticsDispensed.values) {
      const seedableNarcoticsDispensed = fetchedNarcoticsDispensed.values.map((item) =>
        narcoticDispenseRowToObject(item)
      );

      for (const narcoticDispense of seedableNarcoticsDispensed) {
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
      }

      const [newCount] = await tx
        .update(status)
        .set({
          value: latestNarcoticsDispensedCount + fetchedNarcoticsDispensed.values.length,
        })
        .where(eq(status.item, "narcotics_dispensed"))
        .returning();

      console.log(
        formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
        `♻️✔️ Synced ${fetchedNarcoticsDispensed.values.length} narcotic dispenses. Current count is ${newCount.value}`
      );
    }
  });
}

export async function syncDrugs() {
  // 1. FETCH
  const fetchedDrugs = await getSheetRange(drugs_spreadsheetId, "الأدوية!A:P");

  reportSheetFetch(fetchedDrugs);

  if (!fetchedDrugs.values) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "⚠️♻️ Database Sync Error. Couldn't fetch drugs."
    );
    return;
  }

  // 2. Truncate
  await db.delete(drugs);

  // 3. PARSE new data
  console.info(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), "🧮 Processing Drugs");
  const seedableDrugs = fetchedDrugs.values.slice(1).map((item) => drugRowToObject(item));

  // 4. INSERT New data
  await db.insert(drugs).values(seedableDrugs);

  console.info(
    formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
    `♻️✔️ Synced ${fetchedDrugs.values.length} drugs.`
  );
}
