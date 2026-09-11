/**
 * Rows for /basta-webbhotellet/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * Prices are approximate, not fetched from the vendors' own pages — the build
 * sandbox blocks egress to loopia.se, one.com, hostinger.se and misshosting.se
 * (same block logged in docs/log/O1.md–O3.md). Re-check every row against the
 * linked page before launch; see docs/log/S7.md.
 */
const comparison = {
  slug: "basta-webbhotellet",
  updated: "2026-09-11",
  rows: [
    {
      id: "loopia",
      name: "Loopia",
      partnerId: "loopia",
      badge: "Bäst svenskt alternativ",
      verdict:
        "Ett av de mest etablerade svenska webbhotellen, med egen domänregistrering och support som svarar på svenska under kontorstid. Ett tryggt förstahandsval för en företagshemsida, men sällan det billigaste eller snabbaste alternativet i jämförelsen.",
      price: "Från ca 49 kr/mån vid årsbetalning",
      freeTier: "Ingen gratisnivå, men ofta fri domän första året",
      bestFor: "Företag som vill ha svensk drift och svensk support",
      highlight: "Svensk support, egen domänhantering och lång historik",
      drawback: "Sällan billigast och prestandan är genomsnittlig i klassen",
      sourceUrl: "https://www.loopia.se/",
      sourceDate: "2026-09-11",
    },
    {
      id: "one-com",
      name: "One.com",
      partnerId: "one-com",
      badge: "Bäst pris för en enkel sida",
      verdict:
        "En av Europas största webbhotell, känt för låga introduktionspriser och ett enkelt gränssnitt för den som bara ska ha en sida upp och stå. Priset stiger tydligt efter första perioden, så räkna med förnyelsepriset innan du bestämmer dig.",
      price: "Från ca 39 kr/mån under introduktionsperioden",
      freeTier: "Ingen gratisnivå, men fri domän ingår i de flesta paket",
      bestFor: "Enkel presentationssajt eller WordPress-blogg",
      highlight: "Lågt startpris och ett av de enklaste gränssnitten att komma igång i",
      drawback: "Förnyelsepriset är väsentligt högre än introduktionspriset",
      sourceUrl: "https://www.one.com/sv/",
      sourceDate: "2026-09-11",
    },
    {
      id: "hostinger",
      name: "Hostinger",
      partnerId: "hostinger",
      badge: "Bäst prestanda för pengarna",
      verdict:
        "Ett internationellt budgethotell som konkurrerar hårt på pris och samtidigt håller god prestanda tack vare cache och modern serverarkitektur i sina högre paket. Supporten sker på engelska via chatt, inte svensk telefonsupport.",
      price: "Från ca 29 kr/mån under introduktionsperioden",
      freeTier: "Ingen gratisnivå, men pengarna-tillbaka-period vid uppsägning tidigt",
      bestFor: "Prismedvetna företag som klarar sig utan svensk telefonsupport",
      highlight: "Aggressivt introduktionspris och stark prestanda i de större paketen",
      drawback: "Ingen svensk telefonsupport och förnyelsepriset är betydligt högre",
      sourceUrl: "https://www.hostinger.se/",
      sourceDate: "2026-09-11",
    },
    {
      id: "miss-hosting",
      name: "Miss Hosting",
      partnerId: "miss-hosting",
      badge: "Bäst personlig support",
      verdict:
        "Ett mindre svenskt webbhotell som profilerar sig på personlig och snabb support snarare än att vara billigast. Passar den som vill kunna ringa och prata med samma sorts folk varje gång, snarare än att chatta med en supportkö.",
      price: "Från ca 59 kr/mån vid årsbetalning",
      freeTier: "Ingen gratisnivå, men pengarna-tillbaka-garanti de första veckorna",
      bestFor: "Företag som prioriterar snabb, personlig svensk support",
      highlight: "Svensk support med rykte om snabba, personliga svar",
      drawback: "Mindre aktör med färre datacenter och tillval än de större hotellen",
      sourceUrl: "https://misshosting.se/",
      sourceDate: "2026-09-11",
    },
  ],
};

export default comparison;
