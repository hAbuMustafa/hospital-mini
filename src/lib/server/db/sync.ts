import {
  drugs_spreadsheetId,
  narcotics_spreadsheetId,
  patients_spreadsheetId,
} from "$env/static/private";
import { db } from "$lib/server/db";
import { getSheetRange, getSheetRanges } from "$lib/server/gcp/sheets";
import {
  drugs,
  narcoticsDispensed,
  patientAdmissions,
  patientDischarges,
  patientTransfers,
  status,
} from "$lib/server/db/schema";
import { sheetRowToObject } from "$lib/server/gcp/utils";
import { eq } from "drizzle-orm";

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

  if (
    !latestAdmissionCount ||
    !latestTransferCount ||
    !latestDischargeCount ||
    !latestNarcoticsDispensedCount
  ) {
    console.error("⚠️ DATABASE is out of sync. Probably not initialized.");
    return;
  }

  // 2. FETCH Only what you need
  const fetchedPatientsData = await getSheetRanges(patients_spreadsheetId, [
    `Admissions!C${latestAdmissionCount + 1}:T`,
    `Transfers!B${latestTransferCount + 1}:E`,
    `Discharges!B${latestDischargeCount + 1}:E`,
  ]);

  const fetchedNarcoticsDispensed = await getSheetRange(
    narcotics_spreadsheetId,
    `Dispensed!A${latestNarcoticsDispensedCount + 1}:E`
  );

  // 3. PARSE AND INSERT new data
  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Admissions.values) {
      const seedableAdmissions = fetchedPatientsData.Admissions.values.map((item) =>
        sheetRowToObject(item, "admission")
      ) as unknown as typeof patientAdmissions.$inferInsert;

      await tx.insert(patientAdmissions).values(seedableAdmissions);

      const [newCount] = await tx
        .update(status)
        .set({
          value: latestAdmissionCount + fetchedPatientsData.Admissions.values.length,
        })
        .where(eq(status.item, "admissions"))
        .returning();

      console.log(
        `♻️✔️ Synced ${fetchedPatientsData.Admissions.values.length} Admissions. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Transfers.values) {
      const seedableTransfers = fetchedPatientsData.Transfers.values.map((item) =>
        sheetRowToObject(item, "transfer")
      );

      await tx.insert(patientTransfers).values(seedableTransfers);

      const [newCount] = await tx
        .update(status)
        .set({ value: latestTransferCount + fetchedPatientsData.Transfers.values.length })
        .where(eq(status.item, "transfers"))
        .returning();

      console.log(
        `♻️✔️ Synced ${fetchedPatientsData.Transfers.values.length} Transfers. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientsData.Discharges.values) {
      const seedableDischarges = fetchedPatientsData.Discharges.values.map((item) =>
        sheetRowToObject(item, "discharge")
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
        `♻️✔️ Synced ${fetchedPatientsData.Discharges.values.length} Discharges. Current count is ${newCount.value}`
      );
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedNarcoticsDispensed.values) {
      const seedableNarcoticsDispensed = fetchedNarcoticsDispensed.values.map((item) =>
        sheetRowToObject(item, "narcotic_dispense")
      );

      await tx.insert(narcoticsDispensed).values(seedableNarcoticsDispensed);

      const [newCount] = await tx
        .update(status)
        .set({
          value: latestNarcoticsDispensedCount + fetchedNarcoticsDispensed.values.length,
        })
        .where(eq(status.item, "narcotics_dispensed"))
        .returning();

      console.log(
        `♻️✔️ Synced ${fetchedNarcoticsDispensed.values.length} narcotic dispenses. Current count is ${newCount.value}`
      );
    }
  });
}

export async function syncDrugs() {
  // 1. FETCH
  const fetchedDrugs = await getSheetRange(drugs_spreadsheetId, "الأدوية!A:P");

  if (!fetchedDrugs.values) {
    console.error("⚠️♻️ Database Sync Error. Couldn't fetch drugs.");
    return;
  }

  // 2. Truncate
  await db.delete(drugs);

  // 3. PARSE new data
  const seedableDrugs = fetchedDrugs.values
    .slice(1)
    .map((item) => sheetRowToObject(item, "drug"));

  // 4. INSERT New data
  await db.insert(drugs).values(seedableDrugs);
}
