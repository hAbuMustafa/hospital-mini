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

type ColumnList =
  | typeof drugsColumns
  | typeof AdmissionsColumns
  | typeof TransfersColumns
  | typeof DischargesColumns;

type SeedType = "admission" | "transfer" | "discharge" | "drug";

export function sheetRowToObject(row: (string | number)[], type: SeedType) {
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

    default:
      columnList = drugsColumns;
      break;
  }

  const result: { [key: string]: string | number | Date } = {};

  for (let i = 0; i < row.length; i++) {
    if (row[i] !== "") {
      const fieldName = columnList[i];
      if (fieldName.includes("date") || fieldName.includes("time")) {
        const parsedDate = parseDate(row[i] as string);
        if (parsedDate) result[fieldName] = parsedDate;
      } else {
        result[fieldName] = row[i];
      }
    }
  }

  return result;
}

function parseDate(dateString: string) {
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString.trim())) return null;

  const [m, d, y] = dateString.split("/").map(Number);

  const date = new Date(y, m - 1, d);

  return date;
}
