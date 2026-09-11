import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import "@/styles/globals.css";
import { SITE_NAME, siteUrl } from "@/lib/site";

/**
 * Exactly two families (docs/design/verkstan.md §1): Figtree carries the body,
 * Outfit every heading, card title and result number. Both self-hosted by
 * next/font with `display: swap`, so no third-party CSS and no layout shift.
 */
const body = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const heading = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description:
    "Guider, jämförelser och verktyg för dig som ska starta företag i Sverige.",
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${body.variable} ${heading.variable}`}>
      <body>{children}</body>
    </html>
  );
}
