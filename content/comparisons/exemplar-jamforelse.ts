/**
 * Exempelrader för jämförelsemallen. Ersätts av S5.
 * Shape: src/lib/content/schema.ts › comparisonSchema.
 */
const comparison = {
  slug: "exemplar-jamforelse",
  updated: "2025-09-11",
  rows: [
    {
      id: "bokio",
      name: "Bokio",
      partnerId: "bokio",
      badge: "Bäst för start",
      verdict:
        "Enklast att komma igång med utan tidigare bokföringsvana, och tillräckligt för en enskild firma med få verifikat.",
      price: "Se leverantörens prissida",
      freeTier: "Ja, i grundutförande",
      bestFor: "Enskild firma",
      highlight: "Kort väg från kvitto till bokfört verifikat",
      drawback: "Färre funktioner när volymerna växer",
      sourceUrl: "https://www.bokio.se/priser/",
      sourceDate: "2025-09-11",
    },
    {
      id: "fortnox",
      name: "Fortnox",
      partnerId: "fortnox",
      verdict:
        "Störst ekosystem och det din redovisningsbyrå oftast redan arbetar i, men du betalar per modul.",
      price: "Se leverantörens prissida",
      freeTier: "Nej",
      bestFor: "Aktiebolag med byrå",
      highlight: "Byråer känner redan till systemet",
      drawback: "Modulpriser gör totalen svår att överblicka",
      sourceUrl: "https://www.fortnox.se/priser",
      sourceDate: "2025-09-11",
    },
    {
      id: "visma-eekonomi",
      name: "Visma eEkonomi",
      partnerId: "visma-eekonomi",
      verdict:
        "Mittemellan de två andra: mer struktur än Bokio, enklare paketering än Fortnox.",
      price: "Se leverantörens prissida",
      freeTier: "Nej",
      bestFor: "Växande aktiebolag",
      highlight: "Tydliga paket med fast månadskostnad",
      drawback: "Gränssnittet tar längre tid att lära sig",
      sourceUrl: "https://vismaspcs.se/produkter/bokforingsprogram",
      sourceDate: "2025-09-11",
    },
  ],
};

export default comparison;
