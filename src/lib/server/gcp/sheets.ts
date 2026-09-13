import { sheets, type sheets_v4 } from "@googleapis/sheets";
import { GoogleAuth } from "google-auth-library";
import {
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  narcotics_spreadsheetId,
} from "$env/static/private";
import { formatDate } from "$lib/date/utils";

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
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "Error fetching sheet range:",
      error
    );
    throw error;
  }
}

/**
 * Fetch multiple ranges from a specific Google Sheet
 * @param spreadsheetId - The Google Sheet ID
 * @param ranges - Array of ranges like ['Sheet1!A1:B10', 'Sheet2!C1:D20']
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
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "Error fetching sheet ranges:",
      error
    );
    throw error;
  }
}

/**
 * Appends multiple ranges to a specific Google Sheet
 * @param spreadsheetId - The Google Sheet ID
 * @param range - A range to start append after the last occupied cell, like 'Sheet1!A1:B10' or 'Sheet2'
 * @param values - A 2D array of rows to be insert in the sheet
 * @returns Batch sheet data
 */
export async function appendSheetRow(
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  const rwAPI = sheets({
    version: "v4",
    auth: new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }),
  });

  try {
    const response = await rwAPI.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      includeValuesInResponse: true,
      requestBody: {
        values,
      },
    });

    return {
      updatedRange: response.data.updates?.updatedRange,
      updatedRows: response.data.updates?.updatedRows,
      updatedCells: response.data.updates?.updatedCells,
      data: response.data,
    };
  } catch (error) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "Error appending row to sheet:",
      error
    );
    throw error;
  }
}

export async function saveNarcoticTicketToGoogleSheet(
  ticketId: number,
  row: [Date, string, null, string, number]
) {
  try {
    return await appendSheetRow(narcotics_spreadsheetId, "Dispensed", [
      [formatDate(row[0], "M/D/YYYY HH:mm:ss"), ...row.slice(1)],
    ]);
  } catch (err) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "Ticket",
      ticketId,
      "not saved to Google Sheet"
    );
  }
}

export async function saveNarcoticTicketToGoogleSheetBatch(
  rows: [Date, string, null, string, number][]
) {
  try {
    return await appendSheetRow(
      narcotics_spreadsheetId,
      "Dispensed",
      rows.map((row) => [formatDate(row[0], "M/D/YYYY HH:mm:ss"), ...row.slice(1)])
    );
  } catch (err) {
    console.error(
      formatDate(new Date(), "YYYY-MM-DD (HH:mm:ss)"),
      "Couldn't save to Google Sheet"
    );
  }
}
