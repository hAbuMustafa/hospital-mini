import { syncDrugs } from "$lib/server/db/sync";
import { json } from "@sveltejs/kit";

export async function GET() {
  try {
    await syncDrugs();
    console.log("✔️ Drugs synced successfully");

    return json("OK");
  } catch (e) {
    console.error("⚠️ Drug Sync Failed:\n", e);
    return json("ERROR 500");
  }
}
