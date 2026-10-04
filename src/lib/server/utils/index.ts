import { formatDate } from "$lib/date/utils";

export function logResponseSize(title: string, json: any) {
  const bytes = Buffer.byteLength(JSON.stringify(json), "utf8");
  console.info(
    formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
    `${title} size: ~${(bytes / 1024).toFixed(2)} kB`
  );
}
