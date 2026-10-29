"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { DELIVERY_FEES, PRODUCT, formatNpr } from "@/lib/product";
import Icon from "./Icon";

const initialFields = { fullName: "", phone: "", email: "", location: "" };

function validate(fields) {
  const errors = {};
  if (fields.fullName.trim().length < 2) errors.fullName = "Please enter your full name.";
  if (!/^[+0-9][0-9\s-]{7,16}$/.test(fields.phone.trim())) errors.phone = "Please enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = "Please enter a valid email address.";
  if (fields.location.trim().length < 5) errors.location = "Please share your exact delivery location.";
  return errors;
}

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedQuantity = Number(searchParams.get("quantity"));
  const quantity = Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 10 ? requestedQuantity : 1;
  const [fields, setFields] = useState(initialFields);
  const [deliveryArea, setDeliveryArea] = useState("inside_valley");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const deliveryFee = DELIVERY_FEES[deliveryArea];
  const productTotal = PRODUCT.offerPrice * quantity;
  const total = productTotal + deliveryFee;
  const requestId = useMemo(() => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, []);

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (submitLock.current) return;
    const nextErrors = validate(fields);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    setServerError("");

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Order-Request-ID": requestId },
        body: JSON.stringify({
          ...fields,
          productName: PRODUCT.name,
          quantity,
          pricePerPiece: PRODUCT.offerPrice,
          deliveryArea,
          deliveryFee,
          totalPrice: total
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "We could not submit your order. Please try again.");
      }
      const params = new URLSearchParams({
        orderId: result.orderId,
        product: PRODUCT.name,
        quantity: String(quantity),
        total: String(total),
        demo: result.demoMode ? "1" : "0"
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (error) {
      setServerError(error.message || "Something went wrong. Please try again.");
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.12fr_.88fr] lg:gap-14">
      <form onSubmit={submitOrder} noValidate className="rounded-[2rem] border border-ink/8 bg-white p-6 shadow-card sm:p-9">
        <div className="mb-8">
          <p className="eyebrow">Delivery details</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Complete your order</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55">We’ll call you to confirm before dispatch. Payment is collected on delivery.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="fullName">Full name</label>
            <input className="field" id="fullName" name="fullName" value={fields.fullName} onChange={updateField} autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.fullName)} />
            {errors.fullName && <p className="mt-2 text-xs font-semibold text-red-700">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone number</label>
            <input className="field" id="phone" name="phone" value={fields.phone} onChange={updateField} inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={Boolean(errors.phone)} />
            {errors.phone && <p className="mt-2 text-xs font-semibold text-red-700">{errors.phone}</p>}
          </div>
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input className="field" id="email" name="email" value={fields.email} onChange={updateField} inputMode="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className="mt-2 text-xs font-semibold text-red-700">{errors.email}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="location">Exact location</label>
            <textarea className="field min-h-28 resize-y" id="location" name="location" value={fields.location} onChange={updateField} autoComplete="street-address" placeholder="Kindly share your exact location" aria-invalid={Boolean(errors.location)} />
            {errors.location && <p className="mt-2 text-xs font-semibold text-red-700">{errors.location}</p>}
          </div>
        </div>

        <fieldset className="mt-7">
          <legend className="label">Delivery area</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "inside_valley", title: "Inside Kathmandu Valley", fee: 100 },
              { value: "outside_valley", title: "Outside the Valley", fee: 200 }
            ].map((option) => (
              <label key={option.value} className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${deliveryArea === option.value ? "border-plum bg-rosewash/55 ring-2 ring-plum/10" : "border-ink/10 hover:border-plum/30"}`}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="deliveryArea" value={option.value} checked={deliveryArea === option.value} onChange={() => setDeliveryArea(option.value)} className="h-4 w-4 accent-plum" />
                  <span className="text-sm font-bold">{option.title}</span>
                </span>
                <span className="text-sm font-extrabold text-plum">{formatNpr(option.fee)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 rounded-2xl bg-ivory p-5">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/40">Order information</p>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="block text-xs text-ink/45">Product</span><strong>{PRODUCT.name}</strong></p>
            <p><span className="block text-xs text-ink/45">Quantity</span><strong>{quantity}</strong></p>
            <p><span className="block text-xs text-ink/45">Price per piece</span><strong>{formatNpr(PRODUCT.offerPrice)}</strong></p>
            <p><span className="block text-xs text-ink/45">Payment method</span><strong>Cash on Delivery</strong></p>
          </div>
        </div>

        {serverError && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">{serverError}</div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary mt-7 w-full gap-2 !py-4">
          {submitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Submitting order...</>
          ) : (
            <>Order now · {formatNpr(total)} <Icon name="arrow" /></>
          )}
        </button>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-ink/45"><Icon name="shield" className="h-4 w-4 text-evergreen" /> Your information is used only to fulfil this order.</p>
      </form>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="overflow-hidden rounded-[2rem] border border-ink/8 bg-white shadow-card">
          <div className="relative aspect-[16/11] bg-rosewash">
            <Image src={PRODUCT.images[0]} alt={PRODUCT.name} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
            <span className="absolute right-4 top-4 rounded-full bg-evergreen px-3 py-1.5 text-xs font-extrabold text-white">Cash on Delivery</span>
          </div>
          <div className="p-6 sm:p-7">
            <p className="font-display text-2xl font-bold">{PRODUCT.name}</p>
            <p className="mt-2 text-sm leading-6 text-ink/55">Premium festive hamper · Quantity {quantity}</p>
            <div className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
              <div className="flex justify-between gap-4"><span className="text-ink/55">Product total</span><strong>{formatNpr(productTotal)}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-ink/55">Delivery</span><strong>{formatNpr(deliveryFee)}</strong></div>
              <div className="flex justify-between gap-4 border-t border-ink/10 pt-4 text-lg"><span className="font-extrabold">Total</span><strong className="text-plum">{formatNpr(total)}</strong></div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[{ icon: "phone", text: "Phone confirmation before dispatch" }, { icon: "truck", text: "Delivery available across Nepal" }, { icon: "shield", text: "Pay safely upon delivery" }].map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white/70 p-4 text-sm font-bold text-ink/65"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-evergreen/10 text-evergreen"><Icon name={item.icon} className="h-4 w-4" /></span>{item.text}</div>
          ))}
        </div>
      </aside>
    </div>
  );
}
