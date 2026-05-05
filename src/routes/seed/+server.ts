import { json } from "@sveltejs/kit";
import { seed_pw } from "$env/static/private";
import { initialize } from "$lib/server/db/init.js";

export async function POST({ request }) {
  const { pw } = await request.json();

  if (!pw && pw !== seed_pw) return json("SURE THING! All seeding is skipped 🫡");

  await initialize();
}
