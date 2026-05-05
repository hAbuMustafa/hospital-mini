import { syncPatients } from "$lib/server/db/sync";
import { json } from "@sveltejs/kit";

export async function GET() {
  try {
    await syncPatients();
    console.log("✔️ Patients synced successfully");

    return json("OK");
  } catch (e) {
    console.error("⚠️ Patient Sync Failed:\n", e);
    return json("ERROR 500");
  }
}
