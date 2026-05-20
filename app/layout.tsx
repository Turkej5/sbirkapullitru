import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CookieBanner from "@/components/cookie-banner";
import Analytics from "@/components/analytics";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz"],
});

const SITE_URL = "https://www.sbirkapullitru.cz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sbírka půllitrů",
    template: "%s — Sbírka půllitrů",
  },
  description:
    "Soukromá sbírka českých i zahraničních půllitrů. Katalog s fotkami, filtry podle země a pivovaru.",
  openGraph: {
    title: "Sbírka půllitrů",
    description: "Soukromá sbírka českých i zahraničních půllitrů.",
    url: SITE_URL,
    siteName: "Sbírka půllitrů",
    locale: "cs_CZ",
    type: "website",
    images: [
      {
        url: "/images/log/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sbírka půllitrů",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sbírka půllitrů",
    description: "Soukromá sbírka českých i zahraničních půllitrů.",
    images: ["/images/log/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1814" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
