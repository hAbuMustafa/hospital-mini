import { json } from "@sveltejs/kit";
import { seed_pw } from "$env/static/private";
import { initialize } from "$lib/server/db/init";
import { formatDate } from "$lib/date/utils";

export async function GET({ url }) {
  const pw = url.searchParams.get("pw");

  if (!pw || pw !== seed_pw) return json("SURE THING! All seeding is skipped 🫡");

  console.log(formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"), "🌱 Seeding Started!");

  console.time("💠 Seeding");
  try {
    await initialize();
  } catch (err) {
    console.error(err);
  }
  console.timeEnd("💠 Seeding");

  return json("✔️ ALL SEEDING IS DONE!");
}
