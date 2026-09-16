/**
 * Rows for /basta-foretagsbank/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * None of the four banks below currently pays this site an affiliate
 * commission — all links are plain (see content/affiliates.ts, category
 * "foretagskonto", disclosure "Vi tjänar inget på den här länken").
 *
 * On 2026-09-16 all four banks' own sites were loaded directly (no sandbox
 * egress block this time). Only one of them publishes concrete figures:
 * - `seb-foretag` is now vendor-confirmed — seb.se publishes an open price
 *   list with startavgift and paketpriser, so the row states them exactly.
 *
 * The other three keep their deliberately generic "kontakta banken"-framing,
 * because the vendors genuinely do not publish a company-account price:
 * - `swedbank-foretag`: the ränte- och prissida only links a PDF-prislista,
 *   with no per-package figure on the page itself.
 * - `nordea-foretag`: nordea.se/foretag/ publishes no company-account price.
 * - `handelsbanken-foretag`: the site is organised around lokalkontor-kontakt
 *   rather than a publicerad prislista, which is what the row already says.
 * No number was invented for those three; only `sourceDate` was refreshed.
 */
const comparison = {
  slug: "basta-foretagsbank",
  updated: "2026-09-16",
  rows: [
    {
      id: "seb-foretag",
      name: "SEB Företag",
      partnerId: "seb-foretag",
      badge: "Bäst om du redan är privatkund",
      verdict:
        "Går snabbast att komma igång med om du redan har SEB som privatbank, eftersom mycket av kundkännedomen redan finns registrerad. Den fördelen försvinner om du byter bank samtidigt som du startar bolag.",
      price: "2 500 kr startavgift, sedan 100 kr/mån (Enkla firman) eller 130 kr/mån",
      freeTier: "Första 6 månaderna gratis på Enkla firman och Företagspaketet",
      bestFor: "Befintliga SEB-kunder som startar bolag",
      highlight: "Snabb onboarding för redan existerande privatkunder; öppet publicerad prislista",
      drawback: "Mindre fördel om du inte redan är kund — då är processen som hos de andra storbankerna",
      sourceUrl: "https://seb.se/foretag/tjanster/aktuella-priser",
      sourceDate: "2026-09-16",
    },
    {
      id: "swedbank-foretag",
      name: "Swedbank Företag",
      partnerId: "swedbank-foretag",
      badge: "Bäst geografiska täckning",
      verdict:
        "Störst kontorsnät av de fyra genom sparbanksstrukturen, vilket märks om du vill träffa någon på plats utanför storstäderna. Digitalt håller den jämna steg med de andra storbankerna, varken bäst eller sämst.",
      price: "Kontakta banken för aktuellt pris — varierar med bolagsform och omsättning",
      freeTier: "Ingen renodlad gratisnivå för företagskonto",
      bestFor: "Företag utanför storstadsregionerna som vill kunna besöka ett kontor",
      highlight: "Bredast fysiska kontorsnät i landet",
      drawback: "Inget som sticker ut digitalt jämfört med övriga storbanker",
      sourceUrl: "https://www.swedbank.se/foretag.html",
      sourceDate: "2026-09-16",
    },
    {
      id: "nordea-foretag",
      name: "Nordea Företag",
      partnerId: "nordea-foretag",
      badge: "Bäst för nordisk verksamhet",
      verdict:
        "Naturligt val om verksamheten även har kunder, leverantörer eller planer i Danmark, Norge eller Finland, tack vare den gemensamma nordiska plattformen. För en renodlat svensk verksamhet ger det ingen extra fördel.",
      price: "Kontakta banken för aktuellt pris — begär offert baserat på bolagets behov",
      freeTier: "Ingen renodlad gratisnivå för företagskonto",
      bestFor: "Bolag med kunder eller planer i övriga Norden",
      highlight: "Samma bank och infrastruktur i flera nordiska länder",
      drawback: "Ingen tydlig fördel om verksamheten är helt Sverigebaserad",
      sourceUrl: "https://www.nordea.se/foretag/",
      sourceDate: "2026-09-16",
    },
    {
      id: "handelsbanken-foretag",
      name: "Handelsbanken Företag",
      partnerId: "handelsbanken-foretag",
      badge: "Bäst för personlig kontorsrelation",
      verdict:
        "Organisationen bygger på självständiga lokalkontor med egen beslutsrätt, vilket ofta ger en fastare kontaktperson än hos de andra storbankerna. Det förutsätter att du hittar rätt kontor och person, vilket kan variera i kvalitet mellan orter.",
      price: "Kontakta banken för aktuellt pris — sätts ofta lokalt av kontoret",
      freeTier: "Ingen renodlad gratisnivå för företagskonto",
      bestFor: "Den som värdesätter en fast kontaktperson över ren digital självbetjäning",
      highlight: "Lokalt beslutsfattande kan ge snabbare och mer skräddarsydda besked",
      drawback: "Kvaliteten kan variera mellan kontor eftersom mycket avgörs lokalt",
      sourceUrl: "https://www.handelsbanken.se/sv/foretag",
      sourceDate: "2026-09-16",
    },
  ],
};

export default comparison;
