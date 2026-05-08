import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { DATABASE_URL } from "$env/static/private";
import * as schema from "./schema";

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = createClient({ url: `file:${DATABASE_URL}` });

export const db = drizzle(client, { schema });
