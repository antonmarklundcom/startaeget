/**
 * Rows for /basta-e-handelsplattform/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * Prices are approximate, not fetched from the vendors' own pages — the build
 * sandbox blocks egress to shopify.com, wikinggruppen.se, quickbutik.com and
 * woocommerce.com (same block logged in docs/log/O1.md–O3.md). Re-check every
 * row against the linked page before launch; see docs/log/S7.md.
 */
const comparison = {
  slug: "basta-e-handelsplattform",
  updated: "2026-09-11",
  rows: [
    {
      id: "shopify",
      name: "Shopify",
      partnerId: "shopify",
      badge: "Bäst internationellt",
      verdict:
        "Världens största e-handelsplattform, med det klart bredaste utbudet av teman och appar. Svenska nystartare tycker ofta att grundpriset och tilläggen för kassa, frakt och appar känns dyrare än de svenskbyggda alternativen, men få plattformar skalar lika smärtfritt om du siktar utanför Sverige.",
      price: "Från ca 250 kr/mån vid årsbetalning",
      freeTier: "Nej, men förlängd testperiod ibland",
      bestFor: "Butiker som vill sälja internationellt eller växa snabbt",
      highlight: "Störst appekosystem och flest färdiga integrationer",
      drawback: "Fler tillägg kostar extra, vilket gör totalpriset svårt att förutse",
      sourceUrl: "https://www.shopify.com/se",
      sourceDate: "2026-09-11",
    },
    {
      id: "wikinggruppen",
      name: "Wikinggruppen",
      partnerId: "wikinggruppen",
      badge: "Bäst svensk support",
      verdict:
        "Svenskbyggd plattform med svensk support som standard och färdiga kopplingar mot svenska betal- och fraktlösningar. Prisbilden brukar landa under Shopifys för en jämförbar liten butik, men utbudet av teman och tredjepartsappar är mindre om du senare vill bygga ut butiken kraftigt.",
      price: "Från ca 400 kr/mån beroende på paket",
      freeTier: "Nej, men testperiod utan bindningstid",
      bestFor: "Svenska butiker som vill ha telefonsupport på svenska",
      highlight: "Svensk support och färdiga svenska betal- och fraktkopplingar",
      drawback: "Mindre app- och temautbud än de internationella jättarna",
      sourceUrl: "https://www.wikinggruppen.se/",
      sourceDate: "2026-09-11",
    },
    {
      id: "quickbutik",
      name: "Quickbutik",
      partnerId: "quickbutik",
      badge: "Bäst för en liten butik",
      verdict:
        "Ett svenskt alternativ som är byggt enkelt och prisvärt för den som säljer ett fåtal produkter och vill komma igång snabbt utan att lära sig ett komplext system. Det gör priset lägre än de större plattformarna, men du får också färre avancerade funktioner den dagen sortimentet växer rejält.",
      price: "Från ca 200 kr/mån",
      freeTier: "Testperiod utan kortuppgifter",
      bestFor: "Nystartade enmansbutiker med litet sortiment",
      highlight: "Enkelt gränssnitt och lågt pris för en liten butik",
      drawback: "Färre avancerade funktioner när butiken växer i storlek",
      sourceUrl: "https://www.quickbutik.com/",
      sourceDate: "2026-09-11",
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      partnerId: "woocommerce",
      badge: "Bäst om du redan har WordPress",
      verdict:
        "Ett gratis, öppet källkods-plugin till WordPress snarare än en färdig tjänst — det finns ingen månadsavgift till WooCommerce själv, men du behöver eget webbhotell, ett tema och oftast några tilläggsplugin, och du ansvarar själv för uppdateringar och säkerhet. Total kostnad varierar därför mycket mer än för de hostade alternativen.",
      price: "Ingen plattformsavgift, men beror på webbhotell och tillägg",
      freeTier: "Själva pluginet är gratis",
      bestFor: "Den som redan driver en WordPress-sajt eller vill äga hela stacken",
      highlight: "Gratis grundplugin och full kontroll över kod och hosting",
      drawback: "Kräver eget webbhotell och egen drift av uppdateringar och säkerhet",
      sourceUrl: "https://woocommerce.com/",
      sourceDate: "2026-09-11",
    },
  ],
};

export default comparison;
