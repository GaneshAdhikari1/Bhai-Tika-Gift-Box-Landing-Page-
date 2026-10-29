import "./globals.css";

export const metadata = {
  title: "Premium Bhai Tika Gift Box | Giftora Nepal",
  description:
    "Send a beautifully arranged Bhai Tika gift hamper anywhere in Nepal. Cash on delivery available.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Premium Bhai Tika Gift Box | Giftora Nepal",
    description: "A festive surprise, beautifully packed and delivered across Nepal.",
    images: ["/products/vaitika-pyaro-dai-ferrero-plum-rosegold.png"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
