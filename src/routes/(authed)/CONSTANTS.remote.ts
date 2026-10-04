import { query } from "$app/server";
import { db } from "$lib/server/db";
import { status } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const getSystemFirstDate = query(async () => {
  return (
    (await db.select().from(status).where(eq(status.item, "first_date")))?.[0]
      ?.value_timestamp ?? new Date()
  );
});

export const getLastPatientFetch = query(async () => {
  return (
    await db.select().from(status).where(eq(status.item, "last_patient_fetch"))
  )?.[0]?.value_timestamp;
});
