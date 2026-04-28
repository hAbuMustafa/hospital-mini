import { initialize } from "$lib/server/db/init";

let initialized = false;

export async function handle({ event, resolve }) {
  if (!initialized) {
    await initialize();

    initialized = true;
  }

  return await resolve(event);
}
