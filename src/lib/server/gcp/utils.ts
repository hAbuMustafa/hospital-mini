import { parseDate, setToEndOfDay } from "$lib/date/utils";
import { countryMap } from "$lib/utils/countries";
import {
  drugs,
  patientAdmissions,
  patientDischarges,
  patientTransfers,
  transactions,
} from "../db/schema";

export function admissionRowToObject(
  row: string[]
): typeof patientAdmissions.$inferInsert & { ward_on_admission: string } {
  return {
    id: row[0],
    name: row[1],
    id_type: row[2],
    id_number: row[3],
    diagnosis: row[4],
    admission_date: parseDate(row[5]),
    ward_on_admission: row[9],
    admission_notes: row[10],
    gender: row[12] !== "" ? Boolean(Number(row[12])) : undefined,
    birthdate: row[13] ? parseDate(row[13]) : undefined,
    insured: row[14] !== "" ? Boolean(Number(row[14])) : undefined,
    nationality: row[16] !== "" ? (countryMap.get(row[16]) ?? row[16]) : undefined,
    referred_from: row[17],
  };
}

export function transferRowToObject(row: string[]): typeof patientTransfers.$inferInsert {
  return {
    patient_id: row[0],
    timestamp: parseDate(row[2]),
    to_ward: row[3],
  };
}

export function dischargeRowToObject(
  row: string[]
): typeof patientDischarges.$inferInsert {
  const discharge_date = parseDate(row[2]);
  setToEndOfDay(discharge_date!);

  return {
    patient_id: row[0],
    timestamp: discharge_date,
    reason: row[3],
  };
}

export function drugRowToObject(row: string[]): typeof drugs.$inferInsert {
  return {
    name_ar: row[0],
    unit: row[1],
    tradename_ar: row[2],
    name: row[3],
    price: Number(row[4]),
    price_resale: Number(row[5]),
    record_4_page: Number(row[6]),
    stock_amount: Number(row[7]),
    query_in_UPA_sheet: row[8],
    occurrences_in_UPA_sheet: Number(row[9]),
    category: row[10],
    id: Number(row[11]),
    record_2_page: Number(row[12]),
    smc_code: Number(row[13]),
    is_used: row[14],
    tradename: row[15],
  };
}

export function narcoticDispenseRowToObject(
  row: string[]
): typeof transactions.$inferInsert & {
  timestamp: Date;
  patient_id: string;
} {
  return {
    timestamp: parseDate(row[0], "M/D/YYYY h:mm:ss")!,
    patient_id: row[1],
    item_id: getNarcoticId(row[3]),
    unit_price: getNarcoticPrice(row[3]),
    qty: Number(row[4]),
  };
}

const narcotics = new Map<string, { id: number; resale_price: number }>();
narcotics.set("ميدازولام 5 ملجم أمبول", { id: 116, resale_price: 7.021875 });
narcotics.set("كيتامين 50 ملجم فيال", { id: 117, resale_price: 33.705 });
narcotics.set("فينتانيل 0.05 ملجم أمبول", { id: 119, resale_price: 19.0995 });
narcotics.set("ميدازولام 15 ملجم أمبول", { id: 229, resale_price: 11.235 });

function getNarcoticId(item: string) {
  return narcotics.get(item)?.id ?? 0;
}

function getNarcoticPrice(item: string) {
  return narcotics.get(item)?.resale_price ?? 0;
}
