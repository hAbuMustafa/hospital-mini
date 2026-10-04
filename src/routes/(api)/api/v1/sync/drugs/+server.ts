import { formatDate } from "$lib/date/utils";
import { syncDrugs } from "$lib/server/db/sync";
import { json, error } from "@sveltejs/kit";

export async function GET() {
  try {
    await syncDrugs();
    console.log(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "✔️ Drugs synced successfully"
    );

    return json("OK");
  } catch (e) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "⚠️ Drug Sync Failed:\n",
      e
    );
    error(429, (e as { message: string }).message);
  }
}
