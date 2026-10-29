import { Suspense } from "react";
import CheckoutForm from "@/components/CheckoutForm";
import Header from "@/components/Header";

export const metadata = {
  title: "Checkout | Giftora Nepal",
  description: "Complete your Cash on Delivery order for the Premium Bhai Tika Gift Box."
};

function LoadingCheckout() {
  return <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-card">Loading your order…</div>;
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8e9e8_0,transparent_32%),#fffaf1]">
      <Header compact />
      <div className="shell py-10 sm:py-16">
        <Suspense fallback={<LoadingCheckout />}>
          <CheckoutForm />
        </Suspense>
      </div>
    </main>
  );
}
