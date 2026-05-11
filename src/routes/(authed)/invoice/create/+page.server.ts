import { formatDate } from "$lib/date/utils.js";
import { db } from "$lib/server/db";
import { patients_view } from "$lib/server/db/schema";
import { and, gte, lte } from "drizzle-orm";

export async function load({ url }) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayString = formatDate(yesterday);

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
    .from(patients_view)
    .where(
      and(
        gte(patients_view.discharge_date, dateFrom),
        lte(patients_view.discharge_date, dateTo),
      ),
    )
    .orderBy(patients_view.admission_date);

  return {
    patients: fetchedPatients,
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(dateTo),
  };
}
