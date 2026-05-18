import { building } from "$app/environment";
import { auth } from "$lib/server/utils/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

export async function handle({ event, resolve }) {
  if (event.url.pathname.startsWith("/api/auth")) {
    return svelteKitHandler({ event, resolve, auth, building });
  }

  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  event.locals.user = session?.user ?? null;
  event.locals.session = session?.session ?? null;

  return resolve(event);
}
