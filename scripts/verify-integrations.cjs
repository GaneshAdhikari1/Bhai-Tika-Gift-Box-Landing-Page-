const { loadEnvConfig } = require("@next/env");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

loadEnvConfig(process.cwd());

async function verify() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  const sheets = google.sheets({ version: "v4", auth });
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    includeGridData: false
  });
  const tab = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === tabName);
  if (!tab) throw new Error(`Google Sheet tab not found: ${tabName}`);

  const values = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${tabName.replaceAll("'", "''")}'!A:M`
  });
  const rows = values.data.values || [];

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.verify();

  console.log(JSON.stringify({
    googleSheets: {
      connected: true,
      tab: tab.properties.title,
      frozenRows: tab.properties.gridProperties?.frozenRowCount || 0,
      gridlinesHidden: Boolean(tab.properties.gridProperties?.hideGridlines),
      bandedRanges: tab.bandedRanges?.length || 0,
      filterApplied: Boolean(tab.basicFilter),
      statusConditionalRules: tab.conditionalFormats?.filter((rule) =>
        rule.ranges?.some((range) => range.startColumnIndex === 11 && range.endColumnIndex === 12)
      ).length || 0,
      alternatingRowRules: tab.conditionalFormats?.filter((rule) =>
        rule.booleanRule?.condition?.type === "CUSTOM_FORMULA" &&
        rule.booleanRule.condition.values?.some((value) => value.userEnteredValue?.includes("ISEVEN(ROW())"))
      ).length || 0,
      columns: rows[0]?.length || 0,
      dataRows: Math.max(0, rows.length - 1),
      lastOrderId: rows.at(-1)?.[0] || null,
      lastStatus: rows.at(-1)?.[11] || null
    },
    email: {
      smtpAuthenticated: true,
      businessRecipientConfigured: Boolean(process.env.BUSINESS_EMAIL),
      customerEmailEnabled: true
    },
    demoMode: process.env.ORDER_DEMO_MODE === "true"
  }, null, 2));
}

verify().catch((error) => {
  console.error(`Integration verification failed: ${error.message}`);
  process.exit(1);
});
