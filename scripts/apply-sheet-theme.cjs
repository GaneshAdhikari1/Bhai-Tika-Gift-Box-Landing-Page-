const { loadEnvConfig } = require("@next/env");
const { google } = require("googleapis");

loadEnvConfig(process.cwd());

async function applyTheme() {
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

  const sheetId = tab.properties.sheetId;
  const rowCount = tab.properties.gridProperties?.rowCount || 5000;
  const ivory = { red: 1, green: 0.98, blue: 0.93 };
  const ink = { red: 0.14, green: 0.08, blue: 0.11 };
  const requests = [
    {
      updateSheetProperties: {
        properties: { sheetId, tabColor: { red: 0.85, green: 0.58, blue: 0.18 } },
        fields: "tabColor"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 13 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 1, green: 1, blue: 1 },
            textFormat: { foregroundColor: ink, fontFamily: "Arial", fontSize: 10 }
          }
        },
        fields: "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat"
      }
    }
  ];

  tab.bandedRanges?.forEach((bandedRange) => {
    requests.push({ deleteBanding: { bandedRangeId: bandedRange.bandedRangeId } });
  });

  const hasStatusFormatting = tab.conditionalFormats?.some((rule) =>
    rule.ranges?.some((range) => range.startColumnIndex === 11 && range.endColumnIndex === 12)
  );
  let nextConditionalIndex = tab.conditionalFormats?.length || 0;
  if (!hasStatusFormatting) {
    const statusColors = [
      ["New Order", { red: 1, green: 0.94, blue: 0.72 }, { red: 0.42, green: 0.27, blue: 0.02 }],
      ["Order Confirmed", { red: 0.84, green: 0.91, blue: 1 }, { red: 0.06, green: 0.25, blue: 0.49 }],
      ["Order Ongoing", { red: 1, green: 0.88, blue: 0.68 }, { red: 0.52, green: 0.25, blue: 0.02 }],
      ["Delivered", { red: 0.82, green: 0.94, blue: 0.87 }, { red: 0.05, green: 0.31, blue: 0.20 }],
      ["Cancelled", { red: 0.98, green: 0.84, blue: 0.84 }, { red: 0.55, green: 0.08, blue: 0.10 }]
    ];
    statusColors.forEach(([status, backgroundColor, foregroundColor]) => {
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 11, endColumnIndex: 12 }],
            booleanRule: {
              condition: { type: "TEXT_EQ", values: [{ userEnteredValue: status }] },
              format: { backgroundColor, textFormat: { foregroundColor, bold: true } }
            }
          },
          index: nextConditionalIndex++
        }
      });
    });
  }

  const hasAlternatingRows = tab.conditionalFormats?.some((rule) =>
    rule.booleanRule?.condition?.type === "CUSTOM_FORMULA" &&
    rule.booleanRule.condition.values?.some((value) => value.userEnteredValue?.includes("ISEVEN(ROW())"))
  );
  if (!hasAlternatingRows) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 13 }],
          booleanRule: {
            condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: "=ISEVEN(ROW())" }] },
            format: { backgroundColor: ivory }
          }
        },
        index: nextConditionalIndex
      }
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: { requests }
  });
  console.log(`Applied readable white/ivory order rows and distinct status colors to ${tabName}.`);
}

applyTheme().catch((error) => {
  console.error(`Sheet theme update failed: ${error.message}`);
  process.exit(1);
});
