import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db_auth } from "$lib/server/db/index-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

export const auth = betterAuth({
  database: drizzleAdapter(db_auth, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    sveltekitCookies(getRequestEvent),
    admin({
      defaultRole: "e-ph-pharmacist",
      adminRole: "admin",
    }),
  ],
});
