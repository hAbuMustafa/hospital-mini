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

  const dateFrom = new Date(dischargesFrom);
  const dateTo = new Date(dischargesTo);
  dateFrom.setHours(0);
  dateFrom.setMinutes(0);
  dateFrom.setSeconds(0);
  dateFrom.setMilliseconds(0);

  dateTo.setHours(23);
  dateTo.setMinutes(59);
  dateTo.setSeconds(59);
  dateTo.setMilliseconds(999);

  const fetchedPatients = await db
    .select()
    .from(patients)
    .where(
      and(
        gte(patients.discharge_date, dateFrom),
        lte(patients.discharge_date, dateTo),
      ),
    )
    .orderBy(patients.admission_date);

  return {
    patients: fetchedPatients,
    dateFrom: `${dateFrom.getFullYear()}-${`${dateFrom.getMonth() + 1}`.padStart(2, "0")}-${`${dateFrom.getDate()}`.padStart(2, "0")}`,
    dateTo: `${dateTo.getFullYear()}-${`${dateTo.getMonth() + 1}`.padStart(2, "0")}-${`${dateTo.getDate()}`.padStart(2, "0")}`,
  };
}
