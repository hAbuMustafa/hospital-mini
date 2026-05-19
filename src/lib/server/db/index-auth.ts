import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { AUTH_DATABASE_URL } from "$env/static/private";
import * as schema from "./schema-auth";

if (!AUTH_DATABASE_URL) throw new Error("AUTH_DATABASE_URL is not set");

const client = createClient({ url: `file:${AUTH_DATABASE_URL}` });

export const db_auth = drizzle(client, { schema });
