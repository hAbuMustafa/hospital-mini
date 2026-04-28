import { db } from "$lib/server/db";
import { patients } from "$lib/server/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";

export async function load({ url }) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayString = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

  const dischargesFrom = url.searchParams.get("f") ?? yesterdayString;
  const dischargesTo = url.searchParams.get("t") ?? yesterdayString;

  const fetchedPatients = await db
    .select()
    .from(patients)
    .where(
      and(
        gte(patients.discharge_date, new Date(dischargesFrom)),
        lte(patients.discharge_date, new Date(dischargesTo)),
      ),
    )
    .orderBy(patients.admission_date);

  return {
    patients: fetchedPatients,
  };
}
