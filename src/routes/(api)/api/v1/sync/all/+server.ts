import { syncDrugs, syncPatients } from "$lib/server/db/sync";
import { json } from "@sveltejs/kit";

export async function GET() {
  try {
    await syncDrugs();
    await syncPatients();
    console.log("✔️ All DATA synced successfully");

    return json("OK");
  } catch (e) {
    console.error("⚠️ Data Sync Failed:\n", e);
    return json("ERROR 500");
  }
}
