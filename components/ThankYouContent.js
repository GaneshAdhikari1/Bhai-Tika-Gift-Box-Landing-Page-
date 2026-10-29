"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRODUCT, formatNpr } from "@/lib/product";
import Icon from "./Icon";

export default function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "Pending confirmation";
  const product = params.get("product") || PRODUCT.name;
  const quantity = Math.max(1, Number(params.get("quantity")) || 1);
  const total = Math.max(PRODUCT.offerPrice, Number(params.get("total")) || PRODUCT.offerPrice);
  const demo = params.get("demo") === "1";

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-evergreen text-white shadow-xl shadow-evergreen/20">
        <Icon name="check" className="h-11 w-11" />
      </div>
      <p className="eyebrow mt-8">Order received</p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-6xl">Thank you for your order!</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink/60">Our sales representative will call you soon to confirm your order.</p>

      {demo && (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Local demo mode is active. This test order was saved locally; Google Sheets and emails will activate after credentials are configured.
        </div>
      )}

      <div className="mt-10 overflow-hidden rounded-[2rem] border border-ink/8 bg-white text-left shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-plum px-6 py-5 text-white sm:px-8">
          <div><p className="text-xs font-bold uppercase tracking-wider text-white/55">Order ID</p><p className="mt-1 font-extrabold">{orderId}</p></div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold">New Order</span>
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex justify-between gap-5 border-b border-ink/8 pb-4"><span className="text-sm text-ink/50">Product ordered</span><strong className="text-right text-sm">{product}</strong></div>
          <div className="flex justify-between gap-5 border-b border-ink/8 pb-4"><span className="text-sm text-ink/50">Quantity</span><strong>{quantity}</strong></div>
          <div className="flex justify-between gap-5 border-b border-ink/8 pb-4"><span className="text-sm text-ink/50">Payment method</span><strong>Cash on Delivery</strong></div>
          <div className="flex justify-between gap-5 pt-1 text-lg"><span className="font-extrabold">Total price</span><strong className="text-plum">{formatNpr(total)}</strong></div>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className="btn-primary gap-2">Back to home <Icon name="arrow" /></Link>
        <a href="mailto:aimarketingwithganesh@gmail.com" className="btn-secondary gap-2"><Icon name="mail" /> Contact support</a>
      </div>
    </div>
  );
}
