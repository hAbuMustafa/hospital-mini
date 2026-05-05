import { json } from "@sveltejs/kit";
import { seed_pw } from "$env/static/private";
import { initialize } from "$lib/server/db/init.js";

export async function GET({ url }) {
  const pw = url.searchParams.get("pw");

  if (!pw || pw !== seed_pw) return json("SURE THING! All seeding is skipped 🫡");

  console.log("🌱 Seeding Started!");

  await initialize();

  return json("✔️ ALL SEEDING IS DONE!");
}
