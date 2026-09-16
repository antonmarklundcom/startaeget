/**
 * Rows for /basta-lagerbolag/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * On 2026-09-16 all three vendor sites were loaded directly (no sandbox
 * egress block this time), with one row changing:
 * - `bolagsstiftarna` is now vendor-confirmed — bolagsstiftarna.se publishes
 *   a fixed total price for a lagerbolag on its own front page, so the row
 *   states the fee and the Bolagsverket charge separately plus the total.
 *
 * Still NOT vendor-confirmed, left generic on purpose:
 * - `standardbolag`: everything routes to a price-inquiry form, no price is
 *   published.
 * - `heinestams`: neither the product page nor the order form shows a price.
 * For those two no number was invented; only `sourceDate` was refreshed.
 *
 * The Bolagsverket nyregistreringsavgift (2 400 kr, e-tjänst) cited in the
 * article prose is sourced directly from bolagsverket.se and not repeated
 * here.
 */
const comparison = {
  slug: "basta-lagerbolag",
  updated: "2026-09-16",
  rows: [
    {
      id: "standardbolag",
      name: "Standardbolag",
      partnerId: "standardbolag",
      badge: "Bäst för snabb, enkel leverans",
      verdict:
        "En etablerad leverantör av lagerbolag med enkel beställningsprocess. Bra val om du vill ha ett rent lagerbolag levererat snabbt, men jämför exakt vilka tilläggstjänster för namnbyte och bolagsordning som ingår innan du bestämmer dig — de skiljer sig från leverantör till leverantör.",
      price: "Pris beror på aktiekapital och tillval, verifiera hos leverantören",
      freeTier: "Ej tillämpligt — engångsköp av bolag",
      bestFor: "Den som vill vara igång med aktiebolag snabbt",
      highlight: "Etablerad aktör med tydlig, känd process",
      drawback: "Kontrollera själv vad som ingår utöver grundbolaget",
      sourceUrl: "https://www.standardbolag.se/",
      sourceDate: "2026-09-16",
    },
    {
      id: "bolagsstiftarna",
      name: "Bolagsstiftarna",
      partnerId: "bolagsstiftarna",
      badge: "Bäst för hjälp med bolagsjuridik",
      verdict:
        "Positionerar sig med bredare rådgivning kring bolagsbildning och bolagsjuridik utöver själva lagerbolaget. Passar dig som vill ha mer stöd i frågor som ägarstruktur och bolagsordning, men den extra servicen kan också göra totalpriset högre än hos en renodlad leverantör.",
      price: "4 695 kr i arvode plus Bolagsverkets avgift 4 600 kr — totalt 9 295 kr",
      freeTier: "Ej tillämpligt — engångsköp av bolag",
      bestFor: "Den som vill ha rådgivning utöver själva bolagsköpet",
      highlight: "Enda av de tre som publicerar ett fast totalpris på sin egen sida",
      drawback:
        "Totalpriset gäller själva lagerbolaget — tillval som namnbyte och ändrad bolagsordning kan tillkomma",
      sourceUrl: "https://www.bolagsstiftarna.se/",
      sourceDate: "2026-09-16",
    },
    {
      id: "heinestams",
      name: "Heinestams",
      partnerId: "heinestams",
      badge: "Bäst för lång branscherfarenhet",
      verdict:
        "En av de äldre aktörerna inom bolagsbildning i Sverige, vilket kan kännas tryggt om du vill handla av en leverantör med lång historik i just den här nischen. Kontrollera ändå aktuella priser och leveranstider själv snarare än att luta dig mot ryktet.",
      price: "Pris beror på aktiekapital och tillval, verifiera hos leverantören",
      freeTier: "Ej tillämpligt — engångsköp av bolag",
      bestFor: "Den som värdesätter en leverantör med lång historik",
      highlight: "Lång erfarenhet specifikt av bolagsbildning",
      drawback: "Jämför ändå pris och leveranstid mot de andra två",
      sourceUrl: "https://www.heinestams.se/",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
