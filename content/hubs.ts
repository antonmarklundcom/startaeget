/**
 * Hub definitions. O1 ships the routing-correct minimum; O2 owns the copy.
 * Shape: src/lib/content/site.ts › hubSchema.
 */
export const hubs = [
  {
    id: "starta-foretag",
    path: "/starta-foretag/",
    title: "Starta företag",
    h1: "Starta företag",
    description:
      "Allt du behöver bestämma innan du registrerar: bolagsform, F-skatt, moms, försäkring och vad det kostar att komma igång.",
    intro:
      "Här samlar vi guiderna om att välja bolagsform, registrera företaget och få ordning på F-skatt, moms och försäkring från dag ett.",
    kind: "hub",
    featured: ["starta-aktiebolag"],
    tint: "mint",
  },
  {
    id: "ekonomi",
    path: "/ekonomi/",
    title: "Ekonomi och bokföring",
    h1: "Ekonomi och bokföring",
    description:
      "Företagskonto, bokföringsprogram, lön eller utdelning, moms och preliminärskatt — förklarat för dig som är ny som företagare.",
    intro:
      "Bokföring, bank och skatt är där de flesta nyföretagare fastnar. Guiderna här tar dig igenom valen i den ordning de faktiskt dyker upp.",
    kind: "hub",
    featured: ["basta-bokforingsprogram"],
    tint: "sky",
  },
  {
    id: "affarside",
    path: "/affarside/",
    title: "Affärsidé och affärsplan",
    h1: "Affärsidé och affärsplan",
    description:
      "Hitta en affärsidé som håller, testa den mot verkligheten och skriv en affärsplan som faktiskt går att använda.",
    intro:
      "Från idélistor och validering till en affärsplan du kan visa banken. Mallar och exempel ingår.",
    kind: "hub",
    featured: [],
    tint: "sun",
  },
  {
    id: "e-handel",
    path: "/e-handel/",
    title: "E-handel",
    h1: "E-handel",
    description:
      "Starta webshop, välj e-handelsplattform och förstå dropshipping, frakt, moms och returer innan du lägger första ordern.",
    intro:
      "Guider för dig som säljer på nätet: plattformsval, uppstart, bokföring och de misstag som kostar mest i början.",
    kind: "hub",
    featured: [],
    tint: "peach",
  },
  {
    id: "hemsida",
    path: "/hemsida/",
    title: "Hemsida och webbhotell",
    h1: "Hemsida och webbhotell",
    description:
      "Domän, webbhotell, WordPress eller hemsidebyggare — och vad en företagshemsida faktiskt behöver kosta.",
    intro:
      "Att få upp en hemsida är enkelt. Att välja rätt domän, webbhotell och verktyg från början sparar dig ett byte senare.",
    kind: "hub",
    featured: [],
    tint: "lilac",
  },
  {
    id: "marknadsforing",
    path: "/marknadsforing/",
    title: "Marknadsföring",
    h1: "Marknadsföring",
    description:
      "SEO, Google Ads, sociala medier och Google företagsprofil — vad som är värt pengarna när marknadsbudgeten är liten.",
    intro:
      "De första kunderna kommer sällan från annonser. Här är kanalerna i den ordning de brukar löna sig för ett nystartat företag.",
    kind: "hub",
    featured: [],
    tint: "rose",
  },
  {
    id: "jamfor",
    path: "/jamfor/",
    title: "Jämförelser",
    h1: "Jämförelser",
    description:
      "Oberoende jämförelser av bokföringsprogram, företagsbanker, försäkringar, webbhotell och kassasystem för nya företag.",
    intro:
      "Varje jämförelse bygger på leverantörernas egna prissidor, med datum för när vi kontrollerade dem senast.",
    kind: "comparisons",
    featured: [],
    tint: "lilac",
  },
] as const;
