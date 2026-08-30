import { formatDate } from "$lib/date/utils";
import type { sheets_v4 } from "@googleapis/sheets";

export function fuzzyQuery(text: string) {
  return "%" + text.replaceAll(/[اأؤإيىئءوةه]/g, "_").replaceAll(" ", "%") + "%";
}

export function reportSheetMultiFetch(
  fetchResult: Record<string, sheets_v4.Schema$ValueRange>
) {
  for (const tableName of Object.keys(fetchResult)) {
    console.info(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "🔻 Fetched",
      fetchResult[tableName].values?.length ?? 0,
      tableName + "s"
    );
  }
}

export function reportSheetFetch(fetchResult: sheets_v4.Schema$ValueRange) {
  console.info(
    formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
    "🔻 Fetched",
    fetchResult.values?.length ?? 0,
    fetchResult.range?.split("!")[0] + "s"
  );
}
