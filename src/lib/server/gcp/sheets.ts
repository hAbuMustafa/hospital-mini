import { google } from "googleapis";
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
const sheets = google.sheets({ version: "v4", auth });

/**
 * Fetch a single range from a specific Google Sheet
 * @param spreadsheetId - The Google Sheet ID
 * @param range - Range like 'Sheet1!A1:B10'
 * @returns Sheet data
 */
export async function getSheetRange(spreadsheetId: string, range: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching sheet range:", error);
    throw error;
  }
}
