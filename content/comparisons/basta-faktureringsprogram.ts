/**
 * Rows for /basta-faktureringsprogram/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * On 2026-09-16 all four rows were re-checked by loading each vendor's own
 * pricing page directly (no sandbox egress block this time), so every price
 * below is vendor-confirmed on its `sourceDate` — the earlier "verifiera hos
 * leverantören" placeholders are gone.
 *
 * Note that `visma-eekonomi` rebranded: the product is now called Spiris. The
 * display name keeps the old name in parentheses and `partnerId` stays
 * `visma-eekonomi`, exactly as in basta-bokforingsprogram.ts, because
 * /go/visma-eekonomi/ is a stable public URL.
 */
const comparison = {
  slug: "basta-faktureringsprogram",
  updated: "2026-09-16",
  rows: [
    {
      id: "fortnox",
      name: "Fortnox",
      partnerId: "fortnox",
      badge: "Bäst om du snart behöver mer",
      verdict:
        "Fakturamodulen är fullt kapabel på egen hand, men du betalar i praktiken för en hel bokföringssvit du kanske inte använder än. Rätt val om du redan vet att bolaget växer in i full bokföring inom kort — annars en dyrare väg än den behöver vara.",
      price: "149 kr/mån för Fakturering plus Access från 29 kr/mån (12 mån avtal)",
      freeTier: "Nej, men kampanjpris för nystartade",
      bestFor: "Bolag som snart behöver full bokföring ändå",
      highlight:
        "Störst byråstöd och integrationsutbud när bolaget växer; Enkel Fakturering finns från 4,90 kr/faktura utan månadsavgift",
      drawback: "Du betalar för moduler du kanske inte använder från start",
      sourceUrl: "https://www.fortnox.se/produkt/prislista",
      sourceDate: "2026-09-16",
    },
    {
      id: "bokio",
      name: "Bokio",
      partnerId: "bokio",
      badge: "Bäst enkel väg in i full bokföring",
      verdict:
        "Fakturamodulen är lika lättillgänglig som resten av Bokio, vilket gör den till ett rimligt förstahandsval om du tror att du snart vill bokföra i samma verktyg. Mindre motiverat om fakturering är allt du någonsin planerar att behöva.",
      price: "269 kr/mån (Basic, årsbetalning) — fakturering ingår i alla paket",
      freeTier: "Begränsad, kontrollera aktuella villkor",
      bestFor: "Den som vill växa in i bokföring i samma verktyg",
      highlight: "Enklast att förstå för den utan tidigare bokföringsvana",
      drawback: "Fakturafunktionen är inte fristående prissatt eller renodlad",
      sourceUrl: "https://www.bokio.se/priser/",
      sourceDate: "2026-09-16",
    },
    {
      id: "visma-eekonomi",
      name: "Spiris (f.d. Visma eEkonomi)",
      partnerId: "visma-eekonomi",
      badge: "Bäst allroundpaket med fakturering",
      verdict:
        "Hette Visma eEkonomi fram till rebrandingen till Spiris — samma program, nytt namn. Fakturering ingår i grundpaketet snarare än som tillägg, vilket gör totalkostnaden lite mer förutsägbar än hos Fortnox. Fortfarande en full ekonomisvit i grunden, så du betalar delvis för funktioner du inte utnyttjar om behovet bara är fakturor.",
      price: "Från 199 kr/mån (paketet Starta) — fakturering ingår",
      freeTier: "6 månader gratis för nystartade bolag (inom 12 mån från start)",
      bestFor: "Den som vill ha fakturering och bokföring i samma paket",
      highlight: "Fakturering ingår i grundpriset utan separat tillägg",
      drawback: "Mer program än du behöver om bara fakturor efterfrågas",
      sourceUrl: "https://www.spiris.se/priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "zervant",
      name: "Zervant",
      badge: "Bäst renodlat och gratis att börja i",
      verdict:
        "Byggt enbart för fakturering, utan bokföringsmoduler du varken vill eller behöver betala för i uppstarten. Bäst för soloföretagaren med få fakturor, men den dagen bolaget behöver full bokföring får du flytta historiken manuellt till ett annat system.",
      price: "Gratis för 5 kunder/5 fakturor per månad, annars från 99,9 kr/mån",
      freeTier: "Ja — 5 kunder och 5 fakturor per månad utan kostnad",
      bestFor: "Soloföretagare och mindre bolag utan behov av full bokföring",
      highlight: "Renodlat, enkelt och utan onödiga bokföringsmoduler",
      drawback: "Ingen väg vidare till full bokföring i samma verktyg",
      sourceUrl: "https://www.zervant.com/sv/priser/",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
