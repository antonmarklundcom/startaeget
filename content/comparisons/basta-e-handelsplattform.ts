/**
 * Rows for /basta-e-handelsplattform/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * On 2026-09-16 all four rows were re-checked by loading each vendor's own
 * pricing page directly (no sandbox egress block this time), so every price
 * below is vendor-confirmed on its `sourceDate` rather than approximated.
 *
 * Two of the rows are priced in USD by the vendor (`shopify`, `woocommerce`).
 * Those figures are stated in USD exactly as published — they are deliberately
 * NOT converted to SEK here, because a hard-coded conversion goes stale with
 * the exchange rate and would stop being the vendor's own number.
 */
const comparison = {
  slug: "basta-e-handelsplattform",
  updated: "2026-09-16",
  rows: [
    {
      id: "shopify",
      name: "Shopify",
      partnerId: "shopify",
      badge: "Bäst internationellt",
      verdict:
        "Världens största e-handelsplattform, med det klart bredaste utbudet av teman och appar. Svenska nystartare tycker ofta att grundpriset och tilläggen för kassa, frakt och appar känns dyrare än de svenskbyggda alternativen, men få plattformar skalar lika smärtfritt om du siktar utanför Sverige.",
      price: "19 US$/mån vid årsbetalning (25 US$/mån månadsvis) för Basic",
      freeTier: "3 dagars gratis provperiod, sedan 1 US$/mån i 3 månader",
      bestFor: "Butiker som vill sälja internationellt eller växa snabbt",
      highlight: "Störst appekosystem och flest färdiga integrationer",
      drawback: "Fler tillägg kostar extra, vilket gör totalpriset svårt att förutse",
      sourceUrl: "https://www.shopify.com/priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "wikinggruppen",
      name: "Wikinggruppen",
      partnerId: "wikinggruppen",
      badge: "Bäst svensk support",
      verdict:
        "Svenskbyggd plattform med svensk support som standard och färdiga kopplingar mot svenska betal- och fraktlösningar. Säljs numera som ett enda paket till ett fast månadspris som ligger klart över de hostade jättarnas instegsnivå, så det är ett alternativ för den som verkligen värderar svensk support och färdiga svenska integrationer — inte för den som ska testa en idé billigt.",
      price: "3 998 kr/mån (paketet WGR Custom, inga nivåer)",
      freeTier: "30 dagars gratis testperiod",
      bestFor: "Svenska butiker som vill ha telefonsupport på svenska",
      highlight: "Svensk support och färdiga svenska betal- och fraktkopplingar",
      drawback:
        "Mindre app- och temautbud än de internationella jättarna, och priset förutsätter 12 månaders bindningstid",
      sourceUrl: "https://www.wikinggruppen.se/priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "quickbutik",
      name: "Quickbutik",
      partnerId: "quickbutik",
      badge: "Bäst för en liten butik",
      verdict:
        "Ett svenskt alternativ som är byggt enkelt och prisvärt för den som säljer ett fåtal produkter och vill komma igång snabbt utan att lära sig ett komplext system. Det gör priset lägre än de större plattformarna, men du får också färre avancerade funktioner den dagen sortimentet växer rejält.",
      price: "Från 199 kr/mån (Startup, årsbetalning)",
      freeTier: "14 dagars testperiod utan kortuppgifter",
      bestFor: "Nystartade enmansbutiker med litet sortiment",
      highlight: "Enkelt gränssnitt och lågt pris för en liten butik",
      drawback: "Färre avancerade funktioner när butiken växer i storlek",
      sourceUrl: "https://www.quickbutik.com/priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      partnerId: "woocommerce",
      badge: "Bäst om du redan har WordPress",
      verdict:
        "Ett gratis, öppet källkods-plugin till WordPress snarare än en färdig tjänst — det finns ingen månadsavgift till WooCommerce själv, men du behöver eget webbhotell, ett tema och oftast några tilläggsplugin, och du ansvarar själv för uppdateringar och säkerhet. Total kostnad varierar därför mycket mer än för de hostade alternativen.",
      price:
        "Ingen plattformsavgift, men hosting ca 25–350 US$/mån och tillägg 29–299 US$/år",
      freeTier: "Själva pluginet är gratis, utan intäktsdelning",
      bestFor: "Den som redan driver en WordPress-sajt eller vill äga hela stacken",
      highlight: "Gratis grundplugin och full kontroll över kod och hosting",
      drawback: "Kräver eget webbhotell och egen drift av uppdateringar och säkerhet",
      sourceUrl: "https://woocommerce.com/pricing/",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
