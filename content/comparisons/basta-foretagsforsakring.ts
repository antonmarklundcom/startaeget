/**
 * Rows for /basta-foretagsforsakring/. Columns are fixed in
 * src/lib/content/schema.ts › COMPARISON_COLUMNS — the same five for every
 * comparison on the site, so the tables stay comparable.
 *
 * Company insurance premiums are quoted per business (bransch, omsättning,
 * antal anställda, risknivå) and are not published as list prices the way a
 * SaaS subscription is. The vendor domains below were unreachable from this
 * sandbox (same egress block documented for S3-S5, see docs/log) so
 * price/freeTier fields are deliberately generic rather than guessed — a
 * human should request quotes before launch.
 */
const comparison = {
  slug: "basta-foretagsforsakring",
  updated: "2026-09-11",
  rows: [
    {
      id: "if-foretag",
      name: "If Företagsförsäkring",
      partnerId: "if-foretag",
      badge: "Bäst brett utbud",
      verdict:
        "En av Sveriges största försäkringsbolag för företag, med paket som täcker de flesta branscher från konsultverksamhet till hantverk. Storleken ger bred branschtäckning, men gör att offerter ofta känns standardiserade snarare än skräddarsydda för en enskild nischverksamhet.",
      price: "Beror på bransch, omsättning och skydd — begär offert",
      freeTier: "Ingen, men kostnadsfri offertförfrågan",
      bestFor: "De flesta branscher som vill ha ett brett, väletablerat alternativ",
      highlight: "Stort utbud av tilläggsmoduler för de flesta branscher",
      drawback: "Kan kännas mer standardiserat än regionalt anpassat för en liten nischverksamhet",
      sourceUrl: "https://www.if.se/foretag",
      sourceDate: "2026-09-11",
    },
    {
      id: "trygg-hansa-foretag",
      name: "Trygg-Hansa Företag",
      partnerId: "trygg-hansa-foretag",
      badge: "Bäst för etablerad SME-täckning",
      verdict:
        "En av de stora, etablerade aktörerna med lång erfarenhet av att försäkra mindre och medelstora företag. Paketen liknar Ifs i bredd, vilket gör att valet mellan de två ofta landar i pris och bemötande snarare än i stora skillnader i vad som täcks.",
      price: "Beror på bransch, omsättning och skydd — begär offert",
      freeTier: "Ingen, men kostnadsfri offertförfrågan",
      bestFor: "Etablerade småföretag som vill ha en känd, stor aktör",
      highlight: "Lång erfarenhet av företagsförsäkring för svenska SME-bolag",
      drawback: "Liknar konkurrenternas grundutbud starkt — jämför offerter noga för att se skillnad",
      sourceUrl: "https://www.trygghansa.se/foretag",
      sourceDate: "2026-09-11",
    },
    {
      id: "lansforsakringar-foretag",
      name: "Länsförsäkringar Företag",
      partnerId: "lansforsakringar-foretag",
      badge: "Bäst lokal service",
      verdict:
        "Organiserat som en federation av regionala, kundägda bolag snarare än en enda koncern, vilket ofta märks i mer personlig service och lokal kännedom om branscher som är vanliga i just din region. Priser och villkor kan skilja sig något mellan de olika länsbolagen.",
      price: "Beror på bransch, omsättning, skydd och vilket länsbolag som offererar",
      freeTier: "Ingen, men kostnadsfri offertförfrågan",
      bestFor: "Företag som värdesätter lokal förankring och personlig kontakt",
      highlight: "Regional, kundägd struktur ger ofta god lokal service",
      drawback: "Villkor och pris kan variera mellan länsbolagen, vilket gör jämförelse mellan orter svårare",
      sourceUrl: "https://www.lansforsakringar.se/foretag/",
      sourceDate: "2026-09-11",
    },
  ],
};

export default comparison;
