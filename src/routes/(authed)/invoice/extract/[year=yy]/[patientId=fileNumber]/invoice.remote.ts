import { query } from "$app/server";
import { db } from "$lib/server/db/";
import {
  drugs,
  narcoticsDispensed,
  patients_view,
  patientTransfers,
  transactions,
  transactionTickets,
} from "$lib/server/db/schema";
import { and, desc, eq, getTableColumns, gt, gte, lte, sql, sum } from "drizzle-orm";
import * as v from "valibot";

export const getPatient = query(v.string(), async (patientId) => {
  const [patient] = await db
    .select()
    .from(patients_view)
    .where(eq(patients_view.id, patientId));

  return patient;
});

export const getDispenses = query(
  v.object({
    patientId: v.string(),
    fromDate: v.date(),
    toDate: v.date(),
  }),
  async (data) => {
    const [patient] = await db
      .select()
      .from(patients_view)
      .where(eq(patients_view.id, data.patientId));

    try {
      const [periodWard] = await db
        .select()
        .from(patientTransfers)
        .where(
          and(
            eq(patientTransfers.patient_id, data.patientId),
            lte(patientTransfers.timestamp, data.fromDate)
          )
        )
        .orderBy(desc(patientTransfers.id))
        .limit(1);

      const narcotics = await db
        .select({
          ...getTableColumns(drugs),
          amount: sql<number>`${sum(narcoticsDispensed.amount)}`,
          total:
            sql<number>`${sum(narcoticsDispensed.amount)} * ${drugs.price_resale}`.as(
              "total"
            ),
        })
        .from(narcoticsDispensed)
        .innerJoin(drugs, eq(narcoticsDispensed.item_id, drugs.id))
        .where(
          and(
            eq(narcoticsDispensed.patient_id, data.patientId),
            gte(narcoticsDispensed.timestamp, data.fromDate),
            lte(narcoticsDispensed.timestamp, data.toDate)
          )
        )
        .groupBy(narcoticsDispensed.item_id);

      const dispenses = await db
        .select({
          ...getTableColumns(drugs),
          amount: sql<number>`${sum(transactions.qty)} * -1`,
          total: sql<number>`${sum(transactions.qty)} * ${drugs.price_resale} * -1`.as(
            "total"
          ),
        })
        .from(transactions)
        .innerJoin(drugs, eq(transactions.item_id, drugs.id))
        .innerJoin(transactionTickets, eq(transactions.ticket_id, transactionTickets.id))
        .where(
          and(
            eq(transactionTickets.patient_id, data.patientId),
            gte(transactionTickets.timestamp, data.fromDate),
            lte(transactionTickets.timestamp, data.toDate)
          )
        )
        .groupBy(transactions.item_id)
        .having((thisView) => gt(thisView.amount, 0));

      return {
        ward: periodWard.to_ward ?? patient.ward_on_admission,
        dispenses: [...narcotics, ...dispenses],
      };
    } catch (err) {
      console.error(err);

      return {
        ward: patient.ward_on_admission,
        dispenses: [],
        error: err,
      };
    }
  }
);
