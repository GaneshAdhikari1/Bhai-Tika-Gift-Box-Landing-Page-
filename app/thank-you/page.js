import { Suspense } from "react";
import Header from "@/components/Header";
import ThankYouContent from "@/components/ThankYouContent";

export const metadata = {
  title: "Thank You for Your Order | Giftora Nepal",
  robots: { index: false, follow: false }
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,#f3d6bd_0,transparent_35%),#fffaf1]">
      <Header compact />
      <div className="shell py-16 sm:py-24">
        <Suspense fallback={<div className="text-center">Loading order…</div>}>
          <ThankYouContent />
        </Suspense>
      </div>
    </main>
  );
}
