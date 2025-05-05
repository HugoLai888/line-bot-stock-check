const { google } = require('googleapis');

const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
const decoded = Buffer.from(base64, 'base64').toString('utf-8');
const credentials = JSON.parse(decoded);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = sheets;
