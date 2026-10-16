import { query } from "$app/server";
import { syncPatients, syncDrugs } from "$lib/server/db/sync";
import { error } from "@sveltejs/kit";

export const startPatientsSync = query(async () => {
  try {
    await syncPatients();
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
  }
  return { success: true };
});

export const startDrugSync = query(async () => {
  try {
    await syncDrugs();
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
  }
  return { success: true };
});

export const startSync = query(async () => {
  try {
    await startPatientsSync();
    await syncDrugs();
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
  }
  return { success: true };
});
