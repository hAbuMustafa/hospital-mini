import { sheets, type sheets_v4 } from "@googleapis/sheets";
import { GoogleAuth } from "google-auth-library";
import { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } from "$env/static/private";

// gather service account key
const credentials = {
  client_email: GOOGLE_CLIENT_EMAIL,
  private_key: GOOGLE_PRIVATE_KEY,
};

// Create auth client with Sheets scope
const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// Initialize the Sheets API once
const sheetsAPI = sheets({ version: "v4", auth });

/**
 * Fetch a single range from a specific Google Sheet
 * @param spreadsheetId - The Google Sheet ID
 * @param range - Range like 'Sheet1!A1:B10'
 * @returns Sheet data
 */
export async function getSheetRange(spreadsheetId: string, range: string) {
  try {
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching sheet range:", error);
    throw error;
  }
}

/**
 * Fetch multiple ranges from a specific Google Sheet
 * @param spreadsheetId - The Google Sheet ID
 * @param ranges - Array of ranges like ['Sheet1!A1:B10', 'Sheet2!C1:D20']
 * @param majorDimension - Optional, defaults to 'ROWS'
 * @returns Batch sheet data
 */
export async function getSheetRanges(spreadsheetId: string, ranges: string[]) {
  try {
    const response = await sheetsAPI.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const result: Record<string, sheets_v4.Schema$ValueRange> = {};

    response.data.valueRanges?.forEach((vr) => {
      if (vr.range) result[vr.range.split("!")[0]] = vr;
    });

    return result;
  } catch (error) {
    console.error("Error fetching sheet ranges:", error);
    throw error;
  }
}
