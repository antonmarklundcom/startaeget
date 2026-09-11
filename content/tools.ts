/** The three decision tools. O3 fills them in and flips `status` to "live". */
export const tools = [
  {
    id: "bolagsform",
    path: "/verktyg/bolagsform/",
    title: "Bolagsformsväljaren",
    short: "Bolagsform",
    description:
      "Svara på åtta frågor och få veta om aktiebolag, enskild firma eller handelsbolag passar din situation bäst.",
    intro:
      "Åtta frågor om vinst, risk, delägare och hur du vill ta ut pengar — sedan ett svar med motiveringen utskriven.",
    status: "stub",
  },
  {
    id: "startkostnad",
    path: "/verktyg/startkostnad/",
    title: "Startkostnadskalkylatorn",
    short: "Startkostnad",
    description:
      "Räkna ut vad det kostar att starta ditt företag: avgifter, aktiekapital, bank, bokföring, försäkring och hemsida.",
    intro:
      "Alla poster du faktiskt betalar vid start, med rimliga standardvärden du kan ändra rad för rad.",
    status: "stub",
  },
  {
    id: "vad-blir-kvar",
    path: "/verktyg/vad-blir-kvar/",
    title: "Vad blir kvar?",
    short: "Vad blir kvar",
    description:
      "Från omsättning till pengar på ditt konto — jämför enskild firma och aktiebolag med samma siffror.",
    intro:
      "Fyll i omsättning och kostnader och se hur mycket som blir kvar efter skatt och avgifter i respektive bolagsform.",
    status: "stub",
  },
] as const;
