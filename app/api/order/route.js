import { NextResponse } from "next/server";
import { z } from "zod";
import { DELIVERY_FEES, PRODUCT } from "@/lib/product";
import { fulfilOrder, normalizeOrder } from "@/lib/order-server";

export const runtime = "nodejs";

const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(100),
  phone: z.string().trim().regex(/^[+0-9][0-9\s-]{7,16}$/, "A valid phone number is required."),
  email: z.string().trim().email("A valid email address is required.").max(254),
  location: z.string().trim().min(5, "Exact location is required.").max(500),
  productName: z.literal(PRODUCT.name),
  quantity: z.coerce.number().int().min(1).max(10),
  pricePerPiece: z.coerce.number().positive(),
  deliveryArea: z.enum(["inside_valley", "outside_valley"]),
  deliveryFee: z.coerce.number().nonnegative(),
  totalPrice: z.coerce.number().positive(),
  website: z.string().max(0).optional()
});

const recentRequests = new Map();

function cleanupRequests() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, timestamp] of recentRequests) {
    if (timestamp < cutoff) recentRequests.delete(key);
  }
}

function originAllowed(request) {
  const configured = process.env.FRONTEND_URL;
  const origin = request.headers.get("origin");
  if (!configured || !origin) return true;
  try {
    return new URL(origin).origin === new URL(configured).origin;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ success: false, message: "Content-Type must be application/json." }, { status: 415 });
  }

  const requestId = request.headers.get("x-order-request-id");
  cleanupRequests();
  if (requestId && recentRequests.has(requestId)) {
    return NextResponse.json({ success: false, message: "This order is already being processed." }, { status: 409 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "The submitted order is not valid JSON." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ success: false, message: "Please check the highlighted order details.", fields }, { status: 400 });
  }

  const expectedDeliveryFee = DELIVERY_FEES[parsed.data.deliveryArea];
  const expectedTotal = PRODUCT.offerPrice * parsed.data.quantity + expectedDeliveryFee;
  if (
    parsed.data.pricePerPiece !== PRODUCT.offerPrice ||
    parsed.data.deliveryFee !== expectedDeliveryFee ||
    parsed.data.totalPrice !== expectedTotal
  ) {
    return NextResponse.json({ success: false, message: "The order price changed. Please refresh and try again." }, { status: 400 });
  }

  if (requestId) recentRequests.set(requestId, Date.now());
  const order = normalizeOrder(parsed.data);

  try {
    const result = await fulfilOrder(order);
    return NextResponse.json({ success: true, orderId: order.orderId, demoMode: result.demoMode }, { status: 201 });
  } catch (error) {
    console.error("Order fulfilment failed", {
      orderId: order.orderId,
      orderPersisted: Boolean(error.orderPersisted),
      message: error.message
    });
    if (requestId) recentRequests.delete(requestId);
    return NextResponse.json(
      {
        success: false,
        message: error.orderPersisted
          ? "Your order was saved, but the confirmation email failed. Please contact Giftora Nepal with your details instead of submitting again."
          : "We could not place your order right now. Please try again or contact Giftora Nepal.",
        orderId: error.orderPersisted ? order.orderId : undefined,
        orderPersisted: Boolean(error.orderPersisted)
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to submit an order." }, { status: 405 });
}
