import Link from "next/link";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="bg-ink py-12 text-white">
      <div className="shell grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-saffron text-ink">
              <Icon name="gift" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold leading-none">Giftora Nepal</p>
              <p className="mt-1 text-xs text-white/50">Thoughtful gifts, beautifully delivered.</p>
            </div>
          </div>
          <p className="max-w-lg text-sm leading-7 text-white/55">
            Festive gifting made simple. Order from anywhere and send love across Nepal with cash on delivery.
          </p>
        </div>
        <div className="space-y-3 text-sm text-white/60 md:text-right">
          <a className="flex items-center gap-2 transition hover:text-white md:justify-end" href="mailto:aimarketingwithganesh@gmail.com">
            <Icon name="mail" className="h-4 w-4" /> aimarketingwithganesh@gmail.com
          </a>
          <p>© {new Date().getFullYear()} Giftora Nepal. All rights reserved.</p>
          <Link className="inline-block text-white/40 underline-offset-4 hover:text-white hover:underline" href="/checkout?quantity=1">Order the gift box</Link>
        </div>
      </div>
    </footer>
  );
}
