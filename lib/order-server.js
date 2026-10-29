import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { DELIVERY_FEES, PRODUCT, formatNpr } from "./product";

const BRAND = process.env.BRAND_NAME || "Giftora Nepal";
const PAYMENT_METHOD = "Cash on Delivery";
const ORDER_STATUS = "New Order";
const SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes"
];
const ORDER_STATUSES = ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generateOrderId() {
  const date = new Date();
  const stamp = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replaceAll("-", "");
  const random = crypto.randomUUID().split("-")[0].toUpperCase();
  return `GNP-${stamp}-${random}`;
}

function nepalDateTime(date) {
  return new Intl.DateTimeFormat("en-NP", {
    timeZone: "Asia/Kathmandu",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function normalizeOrder(input) {
  const quantity = Number(input.quantity);
  const deliveryArea = input.deliveryArea;
  const deliveryFee = DELIVERY_FEES[deliveryArea];
  const pricePerPiece = PRODUCT.offerPrice;
  const totalPrice = pricePerPiece * quantity + deliveryFee;
  const now = new Date();

  return {
    orderId: generateOrderId(),
    createdAt: now.toISOString(),
    displayDate: nepalDateTime(now),
    customerName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    location: input.location.trim(),
    productName: PRODUCT.name,
    quantity,
    pricePerPiece,
    deliveryArea,
    deliveryFee,
    totalPrice,
    paymentMethod: PAYMENT_METHOD,
    orderStatus: ORDER_STATUS,
    notes: ""
  };
}

function requiredCredentialsPresent() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.BUSINESS_EMAIL
  );
}

export function isDemoMode() {
  if (process.env.ORDER_DEMO_MODE === "true") return true;
  return process.env.NODE_ENV !== "production" && !requiredCredentialsPresent();
}

async function saveDemoOrder(order) {
  const dataDirectory = path.join(process.cwd(), "data");
  await mkdir(dataDirectory, { recursive: true });
  await appendFile(path.join(dataDirectory, "demo-orders.jsonl"), `${JSON.stringify(order)}\n`, "utf8");
}

async function ensureOrdersSheet(sheets, spreadsheetId, tabName) {
  const workbook = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false
  });
  let targetSheet = workbook.data.sheets?.find((sheet) => sheet.properties?.title === tabName);

  if (!targetSheet) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: tabName,
              gridProperties: { rowCount: 5000, columnCount: 13, frozenRowCount: 1, hideGridlines: true },
              tabColor: { red: 0.85, green: 0.58, blue: 0.18 }
            }
          }
        }]
      }
    });
    targetSheet = { properties: created.data.replies?.[0]?.addSheet?.properties };
  }

  const sheetId = targetSheet.properties.sheetId;
  const currentRows = targetSheet.properties.gridProperties?.rowCount || 1000;
  const rowCount = Math.max(currentRows, 5000);
  const burgundy = { red: 0.39, green: 0.11, blue: 0.23 };
  const ivory = { red: 1, green: 0.98, blue: 0.93 };
  const rosewash = { red: 0.98, green: 0.93, blue: 0.93 };
  const gold = { red: 0.85, green: 0.58, blue: 0.18 };
  const ink = { red: 0.14, green: 0.08, blue: 0.11 };
  const requests = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { rowCount, columnCount: 13, frozenRowCount: 1, hideGridlines: true },
          tabColor: gold
        },
        fields: "gridProperties.rowCount,gridProperties.columnCount,gridProperties.frozenRowCount,gridProperties.hideGridlines,tabColor"
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 42 },
        fields: "pixelSize"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 13 },
        cell: {
          userEnteredFormat: {
            backgroundColor: burgundy,
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontFamily: "Arial", fontSize: 10 },
            borders: { bottom: { style: "SOLID_THICK", color: gold } }
          }
        },
        fields: "userEnteredFormat"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 13 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 1, green: 1, blue: 1 },
            verticalAlignment: "MIDDLE",
            textFormat: { foregroundColor: ink, fontFamily: "Arial", fontSize: 10 }
          }
        },
        fields: "userEnteredFormat.backgroundColor,userEnteredFormat.verticalAlignment,userEnteredFormat.textFormat"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER", numberFormat: { type: "NUMBER", pattern: "0" } } },
        fields: "userEnteredFormat.horizontalAlignment,userEnteredFormat.numberFormat"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 8, endColumnIndex: 10 },
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT", numberFormat: { type: "NUMBER", pattern: "\"Rs. \"#,##0" } } },
        fields: "userEnteredFormat.horizontalAlignment,userEnteredFormat.numberFormat"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 3, endColumnIndex: 4 },
        cell: { userEnteredFormat: { numberFormat: { type: "TEXT", pattern: "@" } } },
        fields: "userEnteredFormat.numberFormat"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
        fields: "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment"
      }
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 12, endColumnIndex: 13 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
        fields: "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment"
      }
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 11, endColumnIndex: 12 },
        rule: {
          condition: { type: "ONE_OF_LIST", values: ORDER_STATUSES.map((status) => ({ userEnteredValue: status })) },
          strict: true,
          showCustomUi: true,
          inputMessage: "Choose the current order status"
        }
      }
    },
    {
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 13 } }
      }
    }
  ];

  const widths = [170, 155, 160, 125, 210, 260, 230, 80, 125, 125, 155, 155, 210];
  widths.forEach((pixelSize, index) => {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
        properties: { pixelSize },
        fields: "pixelSize"
      }
    });
  });

  targetSheet.bandedRanges?.forEach((bandedRange) => {
    requests.push({
      deleteBanding: { bandedRangeId: bandedRange.bandedRangeId }
    });
  });

  const hasStatusFormatting = targetSheet.conditionalFormats?.some((rule) =>
    rule.ranges?.some((range) => range.startColumnIndex === 11 && range.endColumnIndex === 12)
  );
  let nextConditionalIndex = targetSheet.conditionalFormats?.length || 0;
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

  const hasAlternatingRows = targetSheet.conditionalFormats?.some((rule) =>
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

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName.replaceAll("'", "''")}'!A1:M1`,
    valueInputOption: "RAW",
    requestBody: { values: [SHEET_HEADERS] }
  });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  return sheetId;
}

async function saveToGoogleSheet(order) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  const sheets = google.sheets({ version: "v4", auth });
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
  const safeTabName = `'${tabName.replaceAll("'", "''")}'`;
  await ensureOrdersSheet(sheets, process.env.GOOGLE_SHEET_ID, tabName);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${safeTabName}!A:M`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        order.orderId,
        order.displayDate,
        order.customerName,
        order.phone,
        order.email,
        order.location,
        order.productName,
        order.quantity,
        order.pricePerPiece,
        order.totalPrice,
        order.paymentMethod,
        order.orderStatus,
        order.notes
      ]]
    }
  });
}

function emailFrame(content, preheader) {
  return `<!doctype html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f7f1ea;font-family:Arial,Helvetica,sans-serif;color:#24151c;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f1ea;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(36,21,28,.08);">
          <tr><td style="background:#631c3a;padding:25px 32px;color:#ffffff;">
            <div style="font-family:Georgia,serif;font-size:27px;font-weight:bold;">${escapeHtml(BRAND)}</div>
            <div style="margin-top:5px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e9c986;">Thoughtful gifts, beautifully delivered</div>
          </td></tr>
          <tr><td style="padding:32px;">${content}</td></tr>
          <tr><td style="padding:22px 32px;background:#fffaf1;text-align:center;font-size:12px;line-height:20px;color:#77676d;">
            ${escapeHtml(BRAND)} · Nepal<br>
            <a href="mailto:${escapeHtml(process.env.EMAIL_FROM || process.env.SMTP_USER || "")}" style="color:#631c3a;">${escapeHtml(process.env.EMAIL_FROM || process.env.SMTP_USER || "")}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function row(label, value, strong = false) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #eee7e2;font-size:13px;color:#806f75;">${escapeHtml(label)}</td>
    <td align="right" style="padding:9px 0;border-bottom:1px solid #eee7e2;font-size:13px;${strong ? "font-weight:bold;color:#631c3a;font-size:16px;" : "font-weight:600;color:#24151c;"}">${escapeHtml(value)}</td>
  </tr>`;
}

function businessEmailHtml(order) {
  return emailFrame(`
    <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#e5f3ef;color:#174f43;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">New Order</div>
    <h1 style="margin:18px 0 8px;font-family:Georgia,serif;font-size:34px;line-height:40px;color:#24151c;">A new product order has arrived.</h1>
    <p style="margin:0 0 25px;color:#77676d;font-size:14px;line-height:23px;">Order <strong style="color:#631c3a;">${escapeHtml(order.orderId)}</strong> was received on ${escapeHtml(order.displayDate)}.</p>
    <div style="padding:16px 18px;border-radius:12px;background:#fff3d8;border-left:4px solid #d9952d;font-size:14px;line-height:22px;color:#5b3a0c;font-weight:bold;">Please call the customer soon to confirm this order.</div>
    <h2 style="margin:28px 0 8px;font-size:15px;color:#631c3a;">Customer details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Customer name", order.customerName)}${row("Phone number", order.phone)}${row("Email address", order.email)}${row("Exact location", order.location)}</table>
    <h2 style="margin:28px 0 8px;font-size:15px;color:#631c3a;">Product & payment</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Price per piece", formatNpr(order.pricePerPiece))}${row("Delivery fee", formatNpr(order.deliveryFee))}${row("Total price", formatNpr(order.totalPrice), true)}${row("Payment method", order.paymentMethod)}${row("Order status", order.orderStatus)}</table>
  `, `New order ${order.orderId} from ${order.customerName}`);
}

function customerEmailHtml(order) {
  return emailFrame(`
    <div style="text-align:center;">
      <div style="display:inline-block;width:58px;height:58px;line-height:58px;border-radius:50%;background:#174f43;color:#ffffff;font-size:28px;font-weight:bold;">✓</div>
      <h1 style="margin:20px 0 10px;font-family:Georgia,serif;font-size:34px;line-height:40px;color:#24151c;">Thank you for your order!</h1>
      <p style="margin:0;color:#77676d;font-size:15px;line-height:24px;">Hi ${escapeHtml(order.customerName)}, we have received your order successfully.</p>
    </div>
    <div style="margin-top:28px;padding:20px;border-radius:14px;background:#fffaf1;">
      <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8b2f4e;font-weight:bold;">Order ${escapeHtml(order.orderId)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Delivery fee", formatNpr(order.deliveryFee))}${row("Total price", formatNpr(order.totalPrice), true)}${row("Payment method", order.paymentMethod)}</table>
    </div>
    <div style="margin-top:24px;padding:18px;border-radius:12px;background:#f6e8eb;color:#5b1832;font-size:14px;line-height:23px;text-align:center;font-weight:bold;">Our sales representative will call you soon to confirm your order.</div>
    <p style="margin:24px 0 0;color:#77676d;font-size:14px;line-height:23px;">If you need help, simply reply to this email. Thank you for choosing ${escapeHtml(BRAND)} for your Bhai Tika celebration.</p>
    <p style="margin:20px 0 0;font-size:14px;line-height:22px;">Warmly,<br><strong style="color:#631c3a;">${escapeHtml(BRAND)}</strong></p>
  `, `Your ${BRAND} order has been received.`);
}

async function sendOrderEmails(order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const from = `"${BRAND}" <${fromAddress}>`;

  await transporter.verify();
  await Promise.all([
    transporter.sendMail({
      from,
      to: process.env.BUSINESS_EMAIL,
      replyTo: order.email,
      subject: `New Product Order Received - ${order.orderId}`,
      html: businessEmailHtml(order)
    }),
    transporter.sendMail({
      from,
      to: order.email,
      replyTo: fromAddress,
      subject: `Your Order Has Been Received - ${BRAND}`,
      html: customerEmailHtml(order)
    })
  ]);
}

export async function fulfilOrder(order) {
  if (isDemoMode()) {
    await saveDemoOrder(order);
    return { demoMode: true };
  }

  if (!requiredCredentialsPresent()) {
    throw new Error("Server configuration is incomplete. Google Sheets and SMTP credentials are required.");
  }

  await saveToGoogleSheet(order);
  try {
    await sendOrderEmails(order);
  } catch (error) {
    const wrapped = new Error("The order was saved, but one or more notification emails could not be sent. Please contact support before trying again.");
    wrapped.cause = error;
    wrapped.orderPersisted = true;
    throw wrapped;
  }
  return { demoMode: false };
}
