import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({ url: "file:local.db" });
const db = drizzle(client);

migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => console.log("Done"))
  .catch((err) => {
    console.error("REAL ERROR:", err);
    process.exit(1);
  });
