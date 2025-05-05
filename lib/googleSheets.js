// lib/googleSheets.js
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const base64Credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const sheetId = process.env.GOOGLE_SHEET_ID;

const auth = new GoogleAuth({
  credentials: JSON.parse(Buffer.from(base64Credentials, "base64").toString("utf8")),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

async function searchStock(keyword) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const range = "工作表1!A2:F"; // 根據你的表格實際範圍
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  const results = rows
    .map(row => ({
      code: row[0] || "",
      name: row[1] || "",
      stock: row[4] || "0",
    }))
    .filter(item =>
      item.name.includes(keyword) || item.code.includes(keyword)
    );

  return results;
}

module.exports = { searchStock };
