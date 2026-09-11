/**
 * Rows for /basta-faktureringsprogram/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * Prices are the vendors' own list prices on `sourceDate`. Written during
 * an egress-blocked phase (S5, 2026-09-11) — no vendor pricing page could be
 * reached to verify exact figures, so price/freeTier are phrased as ranges
 * or "verifiera hos leverantören" rather than invented numbers. A human must
 * open each `sourceUrl` before launch.
 */
const comparison = {
  slug: "basta-faktureringsprogram",
  updated: "2026-09-11",
  rows: [
    {
      id: "fortnox",
      name: "Fortnox",
      partnerId: "fortnox",
      badge: "Bäst om du snart behöver mer",
      verdict:
        "Fakturamodulen är fullt kapabel på egen hand, men du betalar i praktiken för en hel bokföringssvit du kanske inte använder än. Rätt val om du redan vet att bolaget växer in i full bokföring inom kort — annars en dyrare väg än den behöver vara.",
      price: "Modulbaserat abonnemang, verifiera hos leverantören",
      freeTier: "Nej, men kampanjpris för nystartade",
      bestFor: "Bolag som snart behöver full bokföring ändå",
      highlight: "Störst byråstöd och integrationsutbud när bolaget växer",
      drawback: "Du betalar för moduler du kanske inte använder från start",
      sourceUrl: "https://www.fortnox.se/",
      sourceDate: "2026-09-11",
    },
    {
      id: "bokio",
      name: "Bokio",
      partnerId: "bokio",
      badge: "Bäst enkel väg in i full bokföring",
      verdict:
        "Fakturamodulen är lika lättillgänglig som resten av Bokio, vilket gör den till ett rimligt förstahandsval om du tror att du snart vill bokföra i samma verktyg. Mindre motiverat om fakturering är allt du någonsin planerar att behöva.",
      price: "Från abonnemang med årsbetalning, verifiera hos leverantören",
      freeTier: "Begränsad, kontrollera aktuella villkor",
      bestFor: "Den som vill växa in i bokföring i samma verktyg",
      highlight: "Enklast att förstå för den utan tidigare bokföringsvana",
      drawback: "Fakturafunktionen är inte fristående prissatt eller renodlad",
      sourceUrl: "https://www.bokio.se/",
      sourceDate: "2026-09-11",
    },
    {
      id: "visma-eekonomi",
      name: "Visma eEkonomi",
      partnerId: "visma-eekonomi",
      badge: "Bäst allroundpaket med fakturering",
      verdict:
        "Fakturering ingår i grundpaketet snarare än som tillägg, vilket gör totalkostnaden lite mer förutsägbar än hos Fortnox. Fortfarande en full ekonomisvit i grunden, så du betalar delvis för funktioner du inte utnyttjar om behovet bara är fakturor.",
      price: "Från abonnemang, ofta introduktionsperiod för nystartade",
      freeTier: "Introduktionsperiod för nystartade bolag",
      bestFor: "Den som vill ha fakturering och bokföring i samma paket",
      highlight: "Fakturering ingår i grundpriset utan separat tillägg",
      drawback: "Mer program än du behöver om bara fakturor efterfrågas",
      sourceUrl: "https://vismaspcs.se/produkter/bokforingsprogram",
      sourceDate: "2026-09-11",
    },
    {
      id: "zervant",
      name: "Zervant",
      badge: "Bäst renodlat och gratis att börja i",
      verdict:
        "Byggt enbart för fakturering, utan bokföringsmoduler du varken vill eller behöver betala för i uppstarten. Bäst för soloföretagaren med få fakturor, men den dagen bolaget behöver full bokföring får du flytta historiken manuellt till ett annat system.",
      price: "Gratis grundnivå, betalda paket vid högre volym — verifiera hos leverantören",
      freeTier: "Ja, för ett begränsat antal fakturor eller kunder",
      bestFor: "Soloföretagare och mindre bolag utan behov av full bokföring",
      highlight: "Renodlat, enkelt och utan onödiga bokföringsmoduler",
      drawback: "Ingen väg vidare till full bokföring i samma verktyg",
      sourceUrl: "https://www.zervant.com/sv/",
      sourceDate: "2026-09-11",
    },
  ],
};

export default comparison;
