# Giftora Nepal — Cash on Delivery Sales Funnel

A production-oriented Next.js sales funnel for the **Premium Bhai Tika Gift Box**. It includes a conversion-focused landing page, checkout, thank-you page, Google Sheets order storage, Gmail/SMTP notifications, customer confirmation emails, and a local demo mode.

## Recommended stack

- **Next.js App Router** for the storefront and server-side order API
- **Tailwind CSS** for responsive styling
- **Zod** for server-side request validation
- **Google Sheets API** with a service account for order storage
- **Nodemailer + Gmail SMTP** for the business and customer emails
- **Vercel** for deployment

This keeps all private credentials in the server environment. Nothing sensitive is sent to browser code.

## Order flow

1. The customer selects a quantity on the landing page and clicks an order CTA.
2. The quantity is passed to `/checkout`; product identity and pricing come from the application’s product configuration.
3. The customer adds contact information, exact location, and chooses inside/outside Kathmandu Valley.
4. The browser submits JSON to `POST /api/order` with a unique request ID.
5. The API validates every field and recalculates the product price, delivery fee, and total on the server.
6. The API generates a unique order ID and Kathmandu date/time.
7. The order is appended to Google Sheets.
8. The API sends the business notification and customer confirmation HTML emails.
9. Only after all required actions succeed does the API return success and the customer is redirected to `/thank-you`.

If Google Sheets fails, emails are not sent and checkout shows an error. If the sheet succeeds but email fails, checkout clearly warns that the order was already saved so the customer does not submit a duplicate.

## Local setup

Requirements: Node.js 20 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local UI testing without external credentials, keep:

```env
ORDER_DEMO_MODE=true
```

Demo orders are appended locally to `data/demo-orders.jsonl`. This file is ignored by Git. **Demo mode does not send emails or write to Google Sheets.** Set it to `false` before performing a real integration test and never enable it in production.

## Environment variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, or `http://localhost:3000` locally |
| `BUSINESS_EMAIL` | Inbox that receives new-order notifications |
| `EMAIL_FROM` | Sender address shown to customers; use the authenticated Gmail address |
| `BRAND_NAME` | Brand shown in transactional emails |
| `GOOGLE_SHEET_ID` | Spreadsheet ID from its URL |
| `GOOGLE_SHEET_TAB_NAME` | Exact order tab name, recommended: `Orders` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service-account email |
| `GOOGLE_PRIVATE_KEY` | Service-account private key; preserve `\n` escapes |
| `SMTP_HOST` | `smtp.gmail.com` for Gmail |
| `SMTP_PORT` | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | Authenticated Gmail address |
| `SMTP_PASS` | Gmail App Password, not the normal account password |
| `EMAIL_SERVICE_API_KEY` | Reserved for switching to an email API provider; not used by SMTP |
| `FRONTEND_URL` | Allowed frontend origin, e.g. `https://your-domain.com` |
| `ORDER_DEMO_MODE` | `true` only for credential-free local testing |

### Private key formatting

In Vercel, paste the service-account private key as the value. Both real newlines and escaped `\n` sequences are handled. Never add `.env.local` or a service-account JSON file to source control.

## Google Spreadsheet setup

### 1. Create the sheet and tab

Create a Google Spreadsheet and rename the order tab to `Orders` (or use another name and set `GOOGLE_SHEET_TAB_NAME` to match it exactly).

Add this header row in cells `A1:M1`, in this exact order:

| Column | Header |
| --- | --- |
| A | Order ID |
| B | Date & Time |
| C | Customer Name |
| D | Phone Number |
| E | Email Address |
| F | Exact Location |
| G | Product Name |
| H | Quantity |
| I | Price Per Piece |
| J | Total Price |
| K | Payment Method |
| L | Order Status |
| M | Notes |

Recommended formatting:

1. Freeze row 1: **View → Freeze → 1 row**.
2. Make row 1 bold with a dark brand background and white text.
3. Format columns I and J as currency or number.
4. Turn on filters: select A1:M1, then **Data → Create a filter**.
5. Enable text wrapping for columns F and M.

### 2. Add the Order Status dropdown

1. Select column L starting from `L2`.
2. Choose **Data → Data validation → Add rule**.
3. Select **Dropdown** and add:
   - New Order
   - Order Confirmed
   - Order Ongoing
   - Delivered
   - Cancelled
4. Give each state a useful color and save the rule.

New submissions use **New Order** automatically.

### 3. Create Google credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **Google Sheets API**.
4. Go to **IAM & Admin → Service Accounts** and create a service account.
5. Open the service account, choose **Keys → Add key → Create new key → JSON**.
6. From the downloaded JSON, use `client_email` as `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` as `GOOGLE_PRIVATE_KEY`.
7. Do not place the JSON file in this project.

### 4. Get the Sheet ID and grant access

For a URL such as:

```text
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
```

the Sheet ID is `1AbCdEfGhIjKlMnOpQrStUvWxYz`.

Click **Share** in Google Sheets, add the service-account email, and grant **Editor** access. The API cannot append rows until this sharing step is complete.

## Gmail SMTP setup

1. Turn on two-step verification for the Gmail account.
2. Create a Google **App Password** for mail.
3. Set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=aimarketingwithganesh@gmail.com
SMTP_PASS=your-16-character-app-password
BUSINESS_EMAIL=aimarketingwithganesh@gmail.com
EMAIL_FROM=aimarketingwithganesh@gmail.com
```

Google Workspace administrators may need to allow App Passwords. For higher email volume, migrate the same email-template functions to Resend, Brevo, or SendGrid.

## Testing real order submission

1. Complete the Google Sheet and Gmail steps above.
2. Set every variable in `.env.local` and set `ORDER_DEMO_MODE=false`.
3. Restart `npm run dev` after changing environment variables.
4. Place an order with an email inbox you can check.
5. Confirm all four outcomes:
   - A new row appears in the correct Google Sheet tab.
   - `BUSINESS_EMAIL` receives the new-order email.
   - The customer address receives the order-received email.
   - The browser opens the thank-you page with the correct order ID and total.
6. Also test invalid fields, an outside-Valley order, and a deliberate credential error. Failed submissions should remain on checkout and show a clear error.

You can verify the Google Sheets and SMTP connections without sending another order:

```bash
npm run verify:integrations
```

The order API automatically creates the configured `Orders` tab when needed and applies the header styling, frozen header row, filters, alternating row bands, column widths, rupee number formats, wrapped address/notes fields, and the Order Status dropdown before appending data.

## Deploying to Vercel

1. Push the project to a private GitHub repository.
2. Import the repository in Vercel as a Next.js project.
3. Add all variables from `.env.example` under **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL`, `FRONTEND_URL`, and the production domain to the same HTTPS origin.
5. Set `ORDER_DEMO_MODE=false` in Production.
6. Deploy and run the complete real-order test above.

The API route uses the Node.js runtime because Google APIs and Nodemailer require server-side Node capabilities. The current code is compatible with Vercel’s Next.js serverless functions.

## Editing product content

Core product data lives in `lib/product.js`. Landing-page copy is in `components/LandingPage.js`. Replace the clearly labeled sample review cards with verified customer feedback before publishing.

Product images live in `public/products/` and are optimized automatically by Next.js Image.

## Routes

- `/` — product landing page
- `/checkout` — Cash on Delivery checkout
- `/thank-you` — order confirmation
- `POST /api/order` — validated server-side order submission
