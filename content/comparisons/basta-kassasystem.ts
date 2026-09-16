/**
 * Rows for /basta-kassasystem/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * Prices are the vendors' own list prices on `sourceDate`. On 2026-09-16 the
 * `zettle` and `sumup` rows were re-checked by loading each vendor's own
 * pricing page directly (no sandbox egress block this time) and corrected —
 * those two are vendor-confirmed, and both state the per-transaction fee,
 * which is the dominant cost in this segment rather than any monthly fee.
 *
 * Zettle rebranded: the product is now called PayPal Point of Sale (vendor's
 * own wording, "Zettle by PayPal blir PayPal Point of Sale"). The display
 * name keeps the old name in parentheses because that is still what people
 * search for, and both `id` and `partnerId` stay `zettle` because
 * /go/zettle/ is a stable public URL — same treatment as Spiris (f.d. Visma
 * eEkonomi) in basta-bokforingsprogram.ts.
 *
 * Still NOT vendor-confirmed, left unchanged on purpose:
 * - `fortnox-kassaregister`: fortnox.se/produkt/kassaregister returns blank
 *   and the general price list has no Kassaregister line item, so the
 *   qualitative price text stays and no number was invented.
 */
const comparison = {
  slug: "basta-kassasystem",
  updated: "2026-09-16",
  rows: [
    {
      id: "zettle",
      name: "PayPal Point of Sale (f.d. Zettle)",
      partnerId: "zettle",
      badge: "Bäst för rörlig försäljning",
      verdict:
        "Hette Zettle fram till rebrandingen till PayPal Point of Sale — samma tjänst, nytt namn. Snabbast att komma igång med om du säljer på marknader, pop-ups eller från en liten disk. Fristående app och kortläsare, men tunnare för dig som växer till flera kassor eller behöver detaljerad personalhantering.",
      price: "Ingen månadsavgift, 1,85 % per kortköp, hårdvara från 249 kr",
      freeTier: "Ingen abonnemangsavgift — Tap to Pay i mobilen kräver ingen extra hårdvara",
      bestFor: "Marknadsstånd, pop-ups och mindre butiker",
      highlight: "Igång på minuter med bara mobil och kortläsare",
      drawback: "Begränsat för flera kassor eller mer avancerad personalhantering",
      sourceUrl: "https://www.zettle.com/se",
      sourceDate: "2026-09-16",
    },
    {
      id: "fortnox-kassaregister",
      name: "Fortnox Kassaregister",
      partnerId: "fortnox",
      badge: "Bäst med Fortnox som bokföring",
      verdict:
        "Vinner mest om du redan bokför i Fortnox — försäljningen flödar in i samma system utan manuell överföring. Har du inte redan valt Fortnox som ekonomisystem är den fördelen borta och du bör jämföra rent på pris och hårdvara.",
      price: "Modulbaserat abonnemang, verifiera hos leverantören",
      freeTier: "Nej, men kampanjer för nystartade förekommer",
      bestFor: "Aktiebolag som redan bokför i Fortnox",
      highlight: "Försäljningsdata går rakt in i bokföringen utan dubbelarbete",
      drawback: "Mindre motiverat om du inte redan använder Fortnox för ekonomin",
      sourceUrl: "https://www.fortnox.se/",
      sourceDate: "2026-09-16",
    },
    {
      id: "sumup",
      name: "SumUp",
      badge: "Bäst som alternativ till Zettle",
      verdict:
        "Konkurrerar rakt mot Zettle med samma typ av mobil kortläsare och liknande målgrupp. Ett genuint alternativ värt att jämföra innan du bestämmer dig, men skillnaderna i avgiftsstruktur och hårdvarusortiment kräver att du läser leverantörens egen och aktuella prislista.",
      price: "Ingen månadsavgift (1,49 %/köp), eller Betalningar Plus 349 kr/mån (0,79 %)",
      freeTier: "Ingen abonnemangsavgift i grundutförandet — hårdvara från 225 kr",
      bestFor: "Småföretag som säljer på flera olika platser",
      highlight: "Brett hårdvarusortiment för olika säljsituationer",
      drawback: "Mindre etablerat i Sverige än Zettle, jämför avgifter noga",
      sourceUrl: "https://www.sumup.com/sv-se/priser/",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
