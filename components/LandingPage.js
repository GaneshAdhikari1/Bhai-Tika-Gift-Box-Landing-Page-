"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PRODUCT, formatNpr } from "@/lib/product";
import FaqList from "./FaqList";
import Footer from "./Footer";
import Header from "./Header";
import Icon from "./Icon";
import ProductGallery from "./ProductGallery";

const benefits = [
  { icon: "gift", title: "All-in-one gift", text: "Sweets, chocolates and a useful keepsake, thoughtfully arranged together." },
  { icon: "star", title: "Premium presentation", text: "Festive net wrapping, satin bow and an elegant personalized-style box." },
  { icon: "clock", title: "Saves precious time", text: "Skip the shopping and wrapping. Your Bhai Tika surprise arrives gift-ready." },
  { icon: "heart", title: "Made to feel personal", text: "A warm, memorable way to celebrate your bond even when you are apart." }
];

const trustItems = [
  { icon: "shield", title: "Cash on delivery", text: "Pay only when it arrives" },
  { icon: "truck", title: "Delivery across Nepal", text: "Inside & outside the Valley" },
  { icon: "phone", title: "Order confirmation", text: "We call before dispatch" }
];

const sampleReviews = [
  {
    name: "Anusha K.",
    location: "Kathmandu",
    image: "/testimonials/anusha-k.png",
    quote: "I wanted something that looked festive without having to shop at several places. The box felt thoughtful and ready to gift."
  },
  {
    name: "Prakriti S.",
    location: "Pokhara",
    image: "/testimonials/prakriti-s.png",
    quote: "The mix of chocolates, mithai and a useful bottle makes the hamper feel complete—a lovely Bhai Tika surprise."
  },
  {
    name: "Srijana R.",
    location: "Lalitpur",
    image: "/testimonials/srijana-r.png",
    quote: "Simple ordering and beautiful presentation make this feel like a warm, personal gift for a brother."
  }
];

function Quantity({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-ink/10 bg-white p-1 shadow-sm">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity" className="grid h-10 w-10 place-items-center rounded-full text-plum transition hover:bg-rosewash">
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className="w-12 text-center text-lg font-extrabold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(10, value + 1))} aria-label="Increase quantity" className="grid h-10 w-10 place-items-center rounded-full text-plum transition hover:bg-rosewash">
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function LandingPage() {
  const [quantity, setQuantity] = useState(1);
  const checkoutHref = `/checkout?quantity=${quantity}`;
  const savings = PRODUCT.regularPrice - PRODUCT.offerPrice;

  return (
    <main>
      <Header />

      <section className="grain relative overflow-hidden border-b border-ink/5 bg-[radial-gradient(circle_at_15%_10%,#f7d6c9_0,transparent_35%),radial-gradient(circle_at_85%_40%,#efdca7_0,transparent_36%),linear-gradient(135deg,#fffaf1_10%,#f8e9e8_100%)] py-14 sm:py-20 lg:py-24">
        <div className="absolute -left-16 top-20 h-48 w-48 rounded-full border border-plum/10" />
        <div className="absolute -right-14 bottom-10 h-72 w-72 rounded-full border border-saffron/20" />
        <div className="shell relative grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-plum/10 bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-plum backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-saffron" /> Bhai Tika festive edition
            </div>
            <h1 className="display-title text-ink">
              A box full of <span className="text-plum">love</span> for your first friend.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/65">
              Celebrate your brother with a premium, gift-ready hamper filled with festive favourites—beautifully packed and delivered anywhere in Nepal.
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-sm font-semibold text-ink/45 line-through">{formatNpr(PRODUCT.regularPrice)}</p>
                <p className="font-display text-4xl font-bold text-plum">{formatNpr(PRODUCT.offerPrice)}</p>
              </div>
              <span className="mb-1 rounded-full bg-evergreen px-3 py-1.5 text-xs font-extrabold text-white">Save {formatNpr(savings)}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={checkoutHref} className="btn-primary gap-2">Purchase now <Icon name="arrow" /></Link>
              <a href="#inside" className="btn-secondary">See what’s inside</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-ink/55">
              <span className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-evergreen" /> Cash on delivery</span>
              <span className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-evergreen" /> Delivery across Nepal</span>
              <span className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-evergreen" /> Gift-ready packaging</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[590px]">
            <div className="absolute -inset-4 rotate-3 rounded-[2.7rem] bg-plum/10" />
            <div className="relative aspect-square overflow-hidden rounded-[2.25rem] border-[10px] border-white bg-white shadow-glow">
              <Image src={PRODUCT.images[0]} alt={PRODUCT.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="float-card absolute -bottom-5 -left-2 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-card backdrop-blur sm:-left-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-rosewash text-plum"><Icon name="heart" className="h-5 w-5" /></span>
                <div><p className="text-xs font-extrabold uppercase tracking-wider text-plum">Made for Bhai Tika</p><p className="mt-0.5 text-xs text-ink/55">Wrapped with festive warmth</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="shell grid gap-4 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-ink/5 bg-ivory px-5 py-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rosewash text-plum"><Icon name={item.icon} className="h-5 w-5" /></span>
              <div><p className="text-sm font-extrabold">{item.title}</p><p className="mt-0.5 text-xs text-ink/50">{item.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="inside" className="py-20 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-2 lg:items-center">
          <ProductGallery />
          <div>
            <p className="eyebrow">Everything, beautifully together</p>
            <h2 className="section-title mt-4">{PRODUCT.name}</h2>
            <p className="mt-5 leading-8 text-ink/62">{PRODUCT.description}</p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Ferrero Rocher chocolates", "Haldiram’s Gulab Jamun", "Premium chocolate treats", "Reusable refreshment bottle", "Festive wooden-style box", "Ready-to-gift wrapping"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-bold text-ink/70"><span className="grid h-6 w-6 place-items-center rounded-full bg-evergreen/10 text-evergreen"><Icon name="check" className="h-3.5 w-3.5" /></span>{item}</li>
              ))}
            </ul>

            <div className="mt-8 rounded-[1.75rem] border border-plum/10 bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-sm text-ink/45 line-through">{formatNpr(PRODUCT.regularPrice)}</p>
                  <p className="font-display text-4xl font-bold text-plum">{formatNpr(PRODUCT.offerPrice)}</p>
                  <p className="mt-1 text-xs font-semibold text-ink/45">+ delivery based on location</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink/45">Quantity</p>
                  <Quantity value={quantity} onChange={setQuantity} />
                </div>
              </div>
              <div className="my-6 h-px bg-ink/10" />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-wider text-ink/45">Product total</p><p className="mt-1 text-2xl font-extrabold text-ink">{formatNpr(PRODUCT.offerPrice * quantity)}</p></div>
                <Link href={checkoutHref} className="btn-primary gap-2">Buy now <Icon name="arrow" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="relative overflow-hidden bg-plum py-20 text-white sm:py-28">
        <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10" />
        <div className="shell relative">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-saffron">More than a hamper</p>
            <h2 className="section-title mt-4">Your love, wrapped and ready.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">A meaningful Bhai Tika surprise without the last-minute rush.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item, index) => (
              <article key={item.title} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.1]">
                <div className="mb-8 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-saffron text-ink"><Icon name={item.icon} /></span><span className="font-display text-3xl text-white/20">0{index + 1}</span></div>
                <h3 className="text-lg font-extrabold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
              </article>
            ))}
          </div>
          <Link href={checkoutHref} className="mt-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-saffron px-7 py-3.5 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:bg-[#e7aa4c]">Order yours today <Icon name="arrow" /></Link>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Made for meaningful moments</p>
            <h2 className="section-title mt-4">Gifting should feel this personal.</h2>
            <p className="mt-4 text-sm leading-6 text-ink/55">From easy ordering to gift-ready presentation, every detail is designed to help sisters send a warm Bhai Tika surprise across Nepal.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {sampleReviews.map((review) => (
              <article key={review.name} className="rounded-[1.75rem] border border-ink/8 bg-ivory p-7 shadow-sm">
                <div className="flex gap-1 text-saffron">{[0,1,2,3,4].map((i) => <Icon key={i} name="star" className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-6 font-display text-2xl font-semibold leading-8 text-ink">“{review.quote}”</p>
                <div className="mt-7 flex items-center gap-3 border-t border-ink/8 pt-5">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                    <Image src={review.image} alt={`Illustrative portrait for ${review.name}'s gifting story`} fill sizes="48px" className="object-cover" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">{review.name}</p>
                    <p className="text-xs text-ink/45">Illustrative gifting story · {review.location}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 sm:py-28">
        <div className="shell grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 className="section-title mt-4">Questions, answered.</h2>
            <p className="mt-5 max-w-md leading-7 text-ink/60">Everything you need to order with confidence. Still unsure? Email us and we’ll help.</p>
            <a href="mailto:aimarketingwithganesh@gmail.com" className="btn-secondary mt-7 gap-2"><Icon name="mail" /> Contact Giftora</a>
          </div>
          <FaqList />
        </div>
      </section>

      <section className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="grain relative mx-auto max-w-[1480px] overflow-hidden rounded-[2.25rem] bg-[linear-gradient(120deg,#f1c985_0%,#e5a443_50%,#c77b2c_100%)] px-6 py-16 sm:px-12 sm:py-20">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-plum">Bhai Tika, made effortless</p>
            <h2 className="section-title mt-4 text-ink">Send a beautiful reminder that you’re always there.</h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-ink/65">Order now for {formatNpr(PRODUCT.offerPrice)}. Cash on delivery, with service across Nepal.</p>
            <Link href={checkoutHref} className="btn-primary mt-8 gap-2">Purchase now <Icon name="arrow" /></Link>
          </div>
        </div>
      </section>

      <Footer />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(36,21,28,.1)] backdrop-blur md:hidden">
        <Link href={checkoutHref} className="btn-primary w-full gap-2">Order now · {formatNpr(PRODUCT.offerPrice * quantity)} <Icon name="arrow" /></Link>
      </div>
    </main>
  );
}
