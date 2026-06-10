import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db_auth } from "$lib/server/db/index-auth";
import { PUBLIC_BETTER_AUTH_URL } from "$env/static/public";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { BETTER_AUTH_SECRET } from "$env/static/private";

export const auth = betterAuth({
  baseURL: PUBLIC_BETTER_AUTH_URL,
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
  trustedOrigins: [PUBLIC_BETTER_AUTH_URL],
  secret: BETTER_AUTH_SECRET,
});
