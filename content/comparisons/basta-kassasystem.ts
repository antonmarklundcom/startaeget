/**
 * Rows for /basta-kassasystem/. Columns are fixed in
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
  slug: "basta-kassasystem",
  updated: "2026-09-11",
  rows: [
    {
      id: "zettle",
      name: "Zettle",
      partnerId: "zettle",
      badge: "Bäst för rörlig försäljning",
      verdict:
        "Snabbast att komma igång med om du säljer på marknader, pop-ups eller från en liten disk. Fristående app och kortläsare, men tunnare för dig som växer till flera kassor eller behöver detaljerad personalhantering.",
      price: "Ingen fast månadskostnad, hårdvara köps separat — verifiera hos leverantören",
      freeTier: "Ingen abonnemangsavgift i grundutförandet, verifiera aktuella villkor",
      bestFor: "Marknadsstånd, pop-ups och mindre butiker",
      highlight: "Igång på minuter med bara mobil och kortläsare",
      drawback: "Begränsat för flera kassor eller mer avancerad personalhantering",
      sourceUrl: "https://www.zettle.com/se",
      sourceDate: "2026-09-11",
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
      sourceDate: "2026-09-11",
    },
    {
      id: "sumup",
      name: "SumUp",
      badge: "Bäst som alternativ till Zettle",
      verdict:
        "Konkurrerar rakt mot Zettle med samma typ av mobil kortläsare och liknande målgrupp. Ett genuint alternativ värt att jämföra innan du bestämmer dig, men skillnaderna i avgiftsstruktur och hårdvarusortiment kräver att du läser leverantörens egen och aktuella prislista.",
      price: "Ingen fast månadskostnad, hårdvara köps separat — verifiera hos leverantören",
      freeTier: "Ingen abonnemangsavgift i grundutförandet, verifiera aktuella villkor",
      bestFor: "Småföretag som säljer på flera olika platser",
      highlight: "Brett hårdvarusortiment för olika säljsituationer",
      drawback: "Mindre etablerat i Sverige än Zettle, jämför avgifter noga",
      sourceUrl: "https://www.sumup.com/sv-se/",
      sourceDate: "2026-09-11",
    },
  ],
};

export default comparison;
