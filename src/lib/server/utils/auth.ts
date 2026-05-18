import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db_auth } from "$lib/server/db/index-auth";
import { PUBLIC_BETTER_AUTH_URL } from "$env/static/public";

export const auth = betterAuth({
  baseURL: PUBLIC_BETTER_AUTH_URL,
  database: drizzleAdapter(db_auth, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "e-ph-pharmacist",
      adminRole: "admin",
    }),
  ],
  trustedOrigins: [PUBLIC_BETTER_AUTH_URL],
});
