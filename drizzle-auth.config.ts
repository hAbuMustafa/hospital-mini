import { defineConfig } from "drizzle-kit";

if (!process.env.AUTH_DATABASE_URL) throw new Error("AUTH_DATABASE_URL is not set");

export default defineConfig({
  schema: "./src/lib/server/db/schema-auth.ts",
  dialect: "sqlite",
  dbCredentials: { url: "file:" + process.env.AUTH_DATABASE_URL },
  verbose: true,
  strict: true,
  out: "./drizzle_auth",
});
