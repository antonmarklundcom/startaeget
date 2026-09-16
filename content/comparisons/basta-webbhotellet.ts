/**
 * Rows for /basta-webbhotellet/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * On 2026-09-16 all four rows were re-checked by loading each vendor's own
 * pricing page directly (no sandbox egress block this time), so every price
 * below is vendor-confirmed on its `sourceDate` rather than approximated.
 *
 * Webbhotell pricing in this segment is almost always an introductory price
 * for the first term followed by a much higher renewal price, so every row
 * states both figures — the renewal price is what the customer actually pays
 * long-term. VAT treatment is noted where the vendor states it.
 */
const comparison = {
  slug: "basta-webbhotellet",
  updated: "2026-09-16",
  rows: [
    {
      id: "loopia",
      name: "Loopia",
      partnerId: "loopia",
      badge: "Bäst svenskt alternativ",
      verdict:
        "Ett av de mest etablerade svenska webbhotellen, med egen domänregistrering och support som svarar på svenska under kontorstid. Ett tryggt förstahandsval för en företagshemsida, men sällan det billigaste eller snabbaste alternativet i jämförelsen.",
      price: "39 kr/mån första året, därefter 159 kr/mån (årsvis, exkl. moms)",
      freeTier: "Ingen gratisnivå, men ofta fri domän första året",
      bestFor: "Företag som vill ha svensk drift och svensk support",
      highlight: "Svensk support, egen domänhantering och lång historik",
      drawback: "Sällan billigast och prestandan är genomsnittlig i klassen",
      sourceUrl: "https://www.loopia.se/webbhotell/priser/",
      sourceDate: "2026-09-16",
    },
    {
      id: "one-com",
      name: "One.com",
      partnerId: "one-com",
      badge: "Bäst pris för en enkel sida",
      verdict:
        "En av Europas största webbhotell, känt för låga introduktionspriser och ett enkelt gränssnitt för den som bara ska ha en sida upp och stå. Priset stiger tydligt efter första perioden, så räkna med förnyelsepriset innan du bestämmer dig.",
      price: "29 kr/mån första året (Starter), därefter 79 kr/mån",
      freeTier: "Ingen gratisnivå, men fri domän ingår i de flesta paket",
      bestFor: "Enkel presentationssajt eller WordPress-blogg",
      highlight: "Lågt startpris och ett av de enklaste gränssnitten att komma igång i",
      drawback: "Förnyelsepriset är väsentligt högre än introduktionspriset",
      sourceUrl: "https://www.one.com/sv-se/webbhotell-hosting/",
      sourceDate: "2026-09-16",
    },
    {
      id: "hostinger",
      name: "Hostinger",
      partnerId: "hostinger",
      badge: "Bäst prestanda för pengarna",
      verdict:
        "Ett internationellt budgethotell som konkurrerar hårt på pris och samtidigt håller god prestanda tack vare cache och modern serverarkitektur i sina högre paket. Supporten sker på engelska via chatt, inte svensk telefonsupport.",
      price: "35,90 kr/mån vid 48 mån bindning, därefter 117,90 kr/mån",
      freeTier: "Ingen gratisnivå, men pengarna-tillbaka-period vid uppsägning tidigt",
      bestFor: "Prismedvetna företag som klarar sig utan svensk telefonsupport",
      highlight: "Aggressivt introduktionspris och stark prestanda i de större paketen",
      drawback:
        "Ingen svensk telefonsupport, och lägsta priset kräver 48 månaders bindning — förnyelsepriset är över tre gånger så högt",
      sourceUrl: "https://www.hostinger.com/se/webbhotell",
      sourceDate: "2026-09-16",
    },
    {
      id: "miss-hosting",
      name: "Miss Hosting",
      partnerId: "miss-hosting",
      badge: "Bäst personlig support",
      verdict:
        "Ett mindre svenskt webbhotell som profilerar sig på personlig och snabb support snarare än att vara billigast. Passar den som vill kunna ringa och prata med samma sorts folk varje gång, snarare än att chatta med en supportkö.",
      price: "32 kr/mån första 12 mån, därefter 1 548 kr/år (exkl. moms)",
      freeTier: "Ingen gratisnivå, men pengarna-tillbaka-garanti de första veckorna",
      bestFor: "Företag som prioriterar snabb, personlig svensk support",
      highlight: "Svensk support med rykte om snabba, personliga svar",
      drawback: "Mindre aktör med färre datacenter och tillval än de större hotellen",
      sourceUrl: "https://misshosting.se/webbhotell/",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
