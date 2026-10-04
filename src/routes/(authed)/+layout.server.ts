import { redirect } from "@sveltejs/kit";

export async function load({ locals, url }) {
  if (!locals.user) {
    throw redirect(303, "/login?redirect_to=" + url.pathname);
  }

  return { user: locals.user };
}
