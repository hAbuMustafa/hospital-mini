import { GoogleAuth } from "google-auth-library";
import { drive } from "@googleapis/drive";
import { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } from "$env/static/private";

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  credentials: {
    client_email: GOOGLE_CLIENT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
});

const driveClient = drive({ version: "v3", auth });

export async function searchDriveFiles(query: string) {
  const listRes = await driveClient.files.list({
    q: `fullText contains '${query}' and trashed = false and mimeType = 'application/pdf'`,
    fields: "files(id, name, mimeType, webContentLink, parents)",
  });

  const files = listRes.data.files;

  if (!files || files.length === 0) {
    return;
  }

  return files;
}
