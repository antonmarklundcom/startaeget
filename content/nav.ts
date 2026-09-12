/** Header and footer navigation. Shape: src/lib/content/site.ts › navSchema. */
export const nav = {
  primary: [
    { label: "Starta företag", href: "/starta-foretag/" },
    { label: "Ekonomi", href: "/ekonomi/" },
    { label: "Affärsidé", href: "/affarside/" },
    { label: "E-handel", href: "/e-handel/" },
    { label: "Hemsida", href: "/hemsida/" },
    { label: "Marknadsföring", href: "/marknadsforing/" },
    { label: "Verktyg", href: "/verktyg/" },
    { label: "Jämför", href: "/jamfor/" },
  ],
  footer: [
    {
      heading: "Guider",
      items: [
        { label: "Starta företag", href: "/starta-foretag/" },
        { label: "Ekonomi och bokföring", href: "/ekonomi/" },
        { label: "Affärsidé", href: "/affarside/" },
        { label: "E-handel", href: "/e-handel/" },
        { label: "Hemsida", href: "/hemsida/" },
        { label: "Marknadsföring", href: "/marknadsforing/" },
        { label: "Blogg", href: "/blogg/" },
      ],
    },
    {
      heading: "Verktyg",
      items: [
        { label: "Bolagsformsväljaren", href: "/verktyg/bolagsform/" },
        { label: "Startkostnadskalkylatorn", href: "/verktyg/startkostnad/" },
        { label: "Vad blir kvar?", href: "/verktyg/vad-blir-kvar/" },
        { label: "Jämförelser", href: "/jamfor/" },
        { label: "Få offert från byrå", href: "/redovisningsbyra/" },
      ],
    },
    {
      heading: "Om sajten",
      items: [
        { label: "Om oss", href: "/om-oss/" },
        { label: "Nyhetsbrev", href: "/nyhetsbrev/" },
        { label: "Kontakt", href: "/kontakt/" },
        { label: "Annonspolicy", href: "/annonspolicy/" },
        { label: "Integritetspolicy", href: "/integritetspolicy/" },
        { label: "Villkor", href: "/villkor/" },
      ],
    },
  ],
} as const;
