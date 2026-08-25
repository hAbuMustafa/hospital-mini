import { formatDate, setToEndOfDay, setToStartOfDay } from "$lib/date/utils";
import { db } from "$lib/server/db";
import {
  drugs,
  patients_view,
  patientTransfers,
  transactions,
  transactionTickets,
} from "$lib/server/db/schema";
import { totalAndAmount } from "$lib/utils/query";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";

export async function load({ url }) {
  const today = new Date();
  const theOtherDay = new Date(today);
  theOtherDay.setDate(today.getDate() - 2);

  const theOtherDayString = formatDate(theOtherDay);

  const dischargesFrom = url.searchParams.get("f") ?? theOtherDayString;
  const dischargesTo = url.searchParams.get("t") ?? theOtherDayString;

  const dateFrom = new Date(dischargesFrom);
  const dateTo = new Date(dischargesTo);
  setToStartOfDay(dateFrom);

  setToEndOfDay(dateTo);

  const fetchedPatients = await db
    .select()
    .from(patients_view)
    .where(
      and(
        gte(patients_view.discharge_date, dateFrom),
        lte(patients_view.discharge_date, dateTo)
      )
    )
    .orderBy(patients_view.admission_date);

  const wards = fetchedPatients.length
    ? await db
        .select({
          patient_id: patientTransfers.patient_id,
          wards: sql<string>`string_agg(${patientTransfers.to_ward}, ' - ')`.as("wards"),
        })
        .from(patientTransfers)
        .where(
          inArray(
            patientTransfers.patient_id,
            fetchedPatients.map((p) => p?.id)
          )
        )
        .groupBy(patientTransfers.patient_id)
    : null;

  const hasNarcotics = await db
    .select({
      patient_id: transactionTickets.patient_id,
      ...totalAndAmount(false),
    })
    .from(transactions)
    .innerJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
    .innerJoin(drugs, eq(transactions.item_id, drugs.id))
    .where(
      and(
        inArray(
          transactionTickets.patient_id,
          fetchedPatients.map((p) => p?.id)
        ),
        eq(drugs.category, "مخدرات")
      )
    )
    .groupBy(transactionTickets.patient_id);

  return {
    patients: fetchedPatients,
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(dateTo),
    wards,
    hasNarcotics,
  };
}
