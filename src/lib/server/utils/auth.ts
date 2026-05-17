import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db_auth } from "$lib/server/db/index-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db_auth, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
