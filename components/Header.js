import Image from "next/image";
import Link from "next/link";

export default function Header({ compact = false }) {
  const logoSource = compact
    ? "/brand/giftora-logo-checkout.png"
    : "/brand/giftora-logo-homepage.png";

  return (
    <header className="relative z-40 border-b border-ink/5 bg-ivory/90 backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between gap-5">
        <Link href="/" className="group shrink-0" aria-label="Giftora Nepal home">
          <Image
            src={logoSource}
            alt="Giftora Nepal"
            width={238}
            height={95}
            priority
            className="h-10 w-auto transition duration-300 group-hover:scale-[1.02] sm:h-12"
            style={{ width: "auto" }}
          />
        </Link>

        {!compact && (
          <nav className="hidden items-center gap-8 text-sm font-bold text-ink/65 md:flex" aria-label="Main navigation">
            <a className="transition hover:text-plum" href="#inside">What’s inside</a>
            <a className="transition hover:text-plum" href="#benefits">Why Giftora</a>
            <a className="transition hover:text-plum" href="#faq">FAQs</a>
          </nav>
        )}

        <Link href={compact ? "/" : "/checkout?quantity=1"} className="btn-primary !min-h-10 !px-5 !py-2.5">
          {compact ? "Back home" : "Order now"}
        </Link>
      </div>
    </header>
  );
}
