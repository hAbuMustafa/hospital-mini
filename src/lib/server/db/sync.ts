import { drugs_spreadsheetId, patients_spreadsheetId } from "$env/static/private";
import { db } from "$lib/server/db";
import { getSheetRange } from "$lib/server/gcp/sheets";
import {
  drugs,
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

  if (!latestAdmissionCount || !latestTransferCount || !latestDischargeCount) {
    console.error("⚠️ DATABASE is out of sync. Probably not initialized.");
    return;
  }

  // 2. FETCH Only what you need
  const fetchedPatientAdmissions = await getSheetRange(
    patients_spreadsheetId,
    `Admissions!C${latestAdmissionCount + 1}:Q`,
  );
  const fetchedPatientTransfers = await getSheetRange(
    patients_spreadsheetId,
    `Transfers!B${latestTransferCount + 1}:E`,
  );
  const fetchedPatientDischarges = await getSheetRange(
    patients_spreadsheetId,
    `Discharges!B${latestDischargeCount + 1}:E`,
  );

  // 3. PARSE AND INSERT new data
  await db.transaction(async (tx) => {
    if (fetchedPatientAdmissions.values) {
      const seedableAdmissions = fetchedPatientAdmissions.values.map((item) =>
        sheetRowToObject(item, "admission"),
      );

      await tx.insert(patientAdmissions).values(seedableAdmissions);

      await tx
        .update(status)
        .set({ value: fetchedPatientAdmissions.values.length })
        .where(eq(status.item, "admissions"));

      console.log(`♻️✔️ Synced ${fetchedPatientAdmissions.values.length} Admissions`);
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientTransfers.values) {
      const seedableTransfers = fetchedPatientTransfers.values.map((item) =>
        sheetRowToObject(item, "transfer"),
      );

      await tx.insert(patientTransfers).values(seedableTransfers);

      await tx
        .update(status)
        .set({ value: fetchedPatientTransfers.values.length })
        .where(eq(status.item, "transfers"));

      console.log(`♻️✔️ Synced ${fetchedPatientTransfers.values.length} Transfers`);
    }
  });

  await db.transaction(async (tx) => {
    if (fetchedPatientDischarges.values) {
      const seedableDischarges = fetchedPatientDischarges.values.map((item) =>
        sheetRowToObject(item, "discharge"),
      );

      await tx.insert(patientDischarges).values(seedableDischarges);

      await tx
        .update(status)
        .set({ value: fetchedPatientDischarges.values.length })
        .where(eq(status.item, "discharges"));

      console.log(`♻️✔️ Synced ${fetchedPatientDischarges.values.length} Discharges`);
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
