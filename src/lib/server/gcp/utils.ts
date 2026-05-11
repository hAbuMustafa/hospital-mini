import { parseDate } from "$lib/date/utils";

const drugsColumns = [
  "name_ar",
  "unit",
  "tradename_ar",
  "name",
  "price",
  "price_resale",
  "record_4_page",
  "stock_amount",
  "query_in_UPA_sheet",
  "occurrences_in_UPA_sheet",
  "category",
  "id",
  "record_2_page",
  "smc_code",
  "is_used",
  "tradename",
] as const;

const AdmissionsColumns = [
  "id",
  "name",
  "id_type",
  "id_number",
  "diagnosis",
  "admission_date",
  "discharge_date",
  "discharge_reason",
  "ward_recent",
  "ward_on_admission",
  "admission_notes",
  "ininininini",
  "gender",
  "birthdate",
  "insured",
] as const;

const TransfersColumns = ["patient_id", "patient_name", "timestamp", "to_ward"] as const;

const DischargesColumns = ["patient_id", "patient_name", "timestamp", "reason"] as const;

const NarcoticDispenseColumns = [
  "timestamp",
  "patient_id",
  "patient_name",
  "item",
  "amount",
] as const;

type ColumnList =
  | typeof drugsColumns
  | typeof AdmissionsColumns
  | typeof TransfersColumns
  | typeof DischargesColumns
  | typeof NarcoticDispenseColumns;

type SeedType = "admission" | "transfer" | "discharge" | "drug" | "narcotic_dispense";

export function sheetRowToObject(row: string[], type: SeedType) {
  let columnList: ColumnList;

  switch (type) {
    case "admission":
      columnList = AdmissionsColumns;
      break;
    case "transfer":
      columnList = TransfersColumns;
      break;
    case "discharge":
      columnList = DischargesColumns;
      break;
    case "drug":
      columnList = drugsColumns;
      break;
    case "narcotic_dispense":
      columnList = NarcoticDispenseColumns;
      break;
  }

  const result: { [key: string]: string | number | Date } = {};

  for (let i = 0; i < row.length; i++) {
    if (row[i] !== "") {
      const fieldName = columnList[i];
      if (
        fieldName.includes("date") ||
        (fieldName.includes("time") && type !== "narcotic_dispense")
      ) {
        const parsedDate = parseDate(row[i]);
        if (parsedDate) result[fieldName] = parsedDate;
      } else if (fieldName.includes("time") && type === "narcotic_dispense") {
        const parsedDatetime = parseDate(row[i], "M/D/YYYY h:mm:ss");
        if (parsedDatetime) result[fieldName] = parsedDatetime;
      } else if (/^\d$/.test(row[i])) {
        // parse booleans
        result[fieldName] = Number(row[i]);
      } else {
        result[fieldName] = row[i];
      }
    }
  }

  return result;
}

const narcotics = new Map<string, number>();
narcotics.set("أتراكوريوم بيسيلات 0.5 ملجم أمبول", 54);
narcotics.set("ميدازولام 5 ملجم أمبول", 116);
narcotics.set("كيتامين 50 ملجم فيال", 117);
narcotics.set("فينتانيل 0.05 ملجم أمبول", 119);
narcotics.set("ميدازولام 15 ملجم أمبول", 229);

function getNarcoticId(item: string) {
  return narcotics.get(item);
}
