import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db_auth } from "$lib/server/db/index-auth";
import { PUBLIC_ORIGIN, PUBLIC_ORIGIN_PROD } from "$env/static/public";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { BETTER_AUTH_SECRET } from "$env/static/private";
import { dev } from "$app/environment";

export const auth = betterAuth({
  baseURL: dev ? PUBLIC_ORIGIN : PUBLIC_ORIGIN_PROD,
  database: drizzleAdapter(db_auth, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [
    admin({
      defaultRole: "e-ph-pharmacist",
      adminRole: "admin",
    }),
    sveltekitCookies(getRequestEvent),
  ],
  trustedOrigins: [PUBLIC_ORIGIN, PUBLIC_ORIGIN_PROD],
  secret: BETTER_AUTH_SECRET,
});
