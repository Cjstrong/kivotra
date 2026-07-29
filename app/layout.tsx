import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Kivotra — Built to stand apart.",
  description:
    "Kivotra engineers custom software, SaaS platforms, automation and high-impact digital experiences for businesses that refuse to blend in.",
  openGraph: {
    title: "Kivotra — Built to stand apart.",
    description:
      "Custom software, intelligent systems and digital experiences, engineered for businesses that refuse to blend in.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050607",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrument.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
