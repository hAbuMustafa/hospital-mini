import { formatDate } from "$lib/date/utils";
import { syncDrugs, syncPatients } from "$lib/server/db/sync";
import { json, error } from "@sveltejs/kit";

export async function GET() {
  try {
    await syncDrugs();
    await syncPatients();
    console.log(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "✔️ All DATA synced successfully"
    );

    return json("OK");
  } catch (e) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "⚠️ Data Sync Failed:\n",
      e
    );
    error(500, { message: (e as { message: string }).message });
  }
}
