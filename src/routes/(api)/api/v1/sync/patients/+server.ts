import { formatDate } from "$lib/date/utils";
import { syncPatients } from "$lib/server/db/sync";
import { json, error } from "@sveltejs/kit";

export async function GET() {
  try {
    await syncPatients();
    console.log(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "✔️ Patients synced successfully"
    );

    return json("OK");
  } catch (e) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "⚠️ Patient Sync Failed:\n",
      e
    );
    error(500, { message: (e as { message: string }).message });
  }
}
