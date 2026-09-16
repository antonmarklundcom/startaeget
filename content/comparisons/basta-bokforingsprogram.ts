/**
 * Rows for /basta-bokforingsprogram/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * Prices are the vendors' own list prices on `sourceDate`. On 2026-09-16 the
 * bokio, fortnox and visma-eekonomi rows were re-checked by loading each
 * vendor's own pricing page directly (no sandbox egress block this time) and
 * corrected where they had drifted — those three are vendor-confirmed.
 *
 * The `bjorn-lunden` rebrand to Lundify and prices were confirmed on
 * 2026-09-16 at bjornlunden.com/se/ and bjornlunden.com/se/priser/.
 * The display name and price are updated; the stable id and partnerId stay.
 *
 * `wint`: wint.se/priser (an earlier session logged a 403 here) resolved
 * cleanly on a later 2026-09-16 check and confirmed the price live —
 * this row is now vendor-confirmed too.
 */
const comparison = {
  slug: "basta-bokforingsprogram",
  updated: "2026-09-16",
  rows: [
    {
      id: "bokio",
      name: "Bokio",
      partnerId: "bokio",
      badge: "Bäst för första året",
      verdict:
        "Byggt för den som aldrig har bokfört. Du väljer vad en händelse är på vanlig svenska och programmet väljer konto. Det gör starten kort och gör samtidigt att du lär dig mindre om vad som faktiskt händer i bokföringen.",
      price: "Från ca 269 kr/mån vid årsbetalning",
      freeTier: "Begränsad, kontrollera aktuella villkor",
      bestFor: "Enskild firma och nystartade bolag",
      highlight: "Lättast att komma igång i utan förkunskaper; svensk support",
      drawback: "Gratisnivån har krympt över tid och färre byråer arbetar i det",
      sourceUrl: "https://www.bokio.se/priser/",
      sourceDate: "2026-09-16",
    },
    {
      id: "fortnox",
      name: "Fortnox",
      partnerId: "fortnox",
      badge: "Bäst när du ska växa",
      verdict:
        "Marknadsstandarden bland svenska redovisningsbyråer, med det största utbudet av integrationer. Priset byggs av moduler, så det som ser billigt ut i grundpaketet kan bli dyrare när lön och tidrapportering läggs till.",
      price: "189 kr/mån för Bokföring plus Access från 29 kr/mån (12 mån avtal)",
      freeTier: "Nej, men kampanjpris för nystartade",
      bestFor: "Aktiebolag som ska ha byrå eller anställda",
      highlight: "Din byrå kan det nästan garanterat; störst integrationsutbud",
      drawback: "Modulprismodellen gör totalkostnaden svår att förutse",
      sourceUrl: "https://www.fortnox.se/produkt/prislista",
      sourceDate: "2026-09-16",
    },
    {
      id: "visma-eekonomi",
      name: "Spiris (f.d. Visma eEkonomi)",
      partnerId: "visma-eekonomi",
      badge: "Bäst allroundpaket",
      verdict:
        "Hette Visma eEkonomi fram till rebrandingen till Spiris — samma program, nytt namn. Ligger nära Fortnox i funktion och byråstöd, med mer inkluderat i grundpriset i stället för som tillval. Nystartade bolag får en lång gratisperiod, vilket gör jämförelsen mot listpriset missvisande det första året.",
      price: "Från 199 kr/mån (paketet Starta)",
      freeTier: "6 månader gratis för bolag startade senaste 12 mån",
      bestFor: "Den som vill ha allt i ett paket",
      highlight: "Fakturering ingår i grundpriset; stort byråstöd",
      drawback: "Gränssnittet är tyngre än de nyare konkurrenternas",
      sourceUrl: "https://www.spiris.se/priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "wint",
      name: "Wint",
      partnerId: "wint",
      badge: "Bäst om du vill slippa",
      verdict:
        "Ligger mitt emellan program och byrå: automatiken sköter löpande bokföring och en redovisningskonsult tar resten. Kostar mer per månad än ett rent program och mindre än en traditionell byrå.",
      price: "Från 625 kr/mån (kampanjpris, under 500 000 kr oms.), annars från 2 290 kr/mån",
      freeTier: "Nej",
      bestFor: "Bolag som hellre betalar än bokför",
      highlight: "Löpande bokföring, bokslut och deklaration i ett abonnemang",
      drawback: "Dyrast i jämförelsen och minst kontroll över detaljerna; bokslut 3 600 kr extra på lägsta paketet",
      sourceUrl: "https://www.wint.se/priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "bjorn-lunden",
      name: "Lundify (f.d. Björn Lundén)",
      partnerId: "bjorn-lunden",
      badge: "Bäst för dig som vill förstå",
      verdict:
        "Byggt av ett förlag som skriver faktaböcker om bokföring, och det märks: mer klassiskt upplagt, med kunskapsbanken inbyggd. Passar den som vill lära sig redovisning och inte bara bli klar med den.",
      price: "Från 199 kr/mån (Easy), 349 kr/mån för Total-paketet (exkl. moms)",
      freeTier: "Nej, men testperiod",
      bestFor: "Den som vill lära sig bokföring på riktigt",
      highlight: "Faktabank och mallar ingår; rimligt pris för småbolag",
      drawback: "Mindre ekosystem och färre integrationer än de tre största",
      sourceUrl: "https://bjornlunden.com/se/priser/",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
