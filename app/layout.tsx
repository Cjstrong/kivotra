import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kivotra — Websites & automation for local business",
  description:
    "We design high-converting websites and build the automations behind them — so your business looks better, responds faster and wastes less time. Book a free strategy call.",
  openGraph: {
    title: "Kivotra — Websites that win attention. Systems that run the business.",
    description:
      "Premium websites and the AI automation behind them, built for local businesses.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
