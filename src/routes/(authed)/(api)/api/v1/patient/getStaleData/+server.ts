import { formatDate, setToEndOfDay } from "$lib/date/utils";
import { db } from "$lib/server/db/";
import {
  drugs,
  patients_view,
  patientTransfers,
  transactions,
  transactionTickets,
} from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import dayjs from "dayjs";
import { and, desc, eq, getTableColumns, gte, lte, sql } from "drizzle-orm";

export async function GET({ url }) {
  const patient_id = url.searchParams.get("patient_id");
  const fromString = url.searchParams.get("f");
  const toString = url.searchParams.get("t");

  if (!patient_id || !fromString || !toString)
    return new Response(null, { status: 400, statusText: "Bad Request" });

  const from = dayjs(fromString).toDate();
  const to = dayjs(toString).toDate();

  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patient_id));

  const [periodWard] =
    fromString === formatDate(patient.admission_date)
      ? [null]
      : await db
          .select()
          .from(patientTransfers)
          .where(
            and(
              eq(patientTransfers.patient_id, patient_id),
              lte(patientTransfers.timestamp, from)
            )
          )
          .orderBy(desc(patientTransfers.id))
          .limit(1);

  setToEndOfDay(to);
  to.setDate(to.getDate() + 1); // +1 offset as a days dispensed registration often happens next day

  const dispensed = await db
    .select({
      ...getTableColumns(drugs),
      amount: sql<number>`sum(${transactions.qty})`.as("amount"),
      total: sql<number>`sum(${transactions.qty}) * ${drugs.price_resale}`.as("total"),
    })
    .from(transactions)
    .innerJoin(drugs, eq(transactions.item_id, drugs.id))
    .innerJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
    .where(
      and(
        eq(transactionTickets.patient_id, patient_id),
        gte(transactionTickets.timestamp, from),
        lte(transactionTickets.timestamp, to)
      )
    )
    .groupBy(transactions.item_id);

  return json({
    ward: periodWard?.to_ward ?? patient.ward_on_admission,
    dispensed,
  });
}
