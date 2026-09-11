/** Home page copy. O2 owns this file. Shape: src/lib/content/site.ts › homeSchema. */
export const home = {
  tagline: "Rätt val från första dagen",
  heroHeading: "Du har bestämt dig för att starta. Vi hjälper dig välja rätt.",
  heroIntro:
    "Verktyg, jämförelser och guider på vanlig svenska för dig som startar ditt första företag. Varje siffra har en källa och ett datum.",
  heroCta: { label: "Hitta rätt bolagsform", href: "/verktyg/bolagsform/" },
  metaTitle: "Starta eget företag — guider och verktyg",
  metaDescription:
    "Verktyg, jämförelser och guider för dig som ska starta företag i Sverige. Välj bolagsform, räkna på startkostnaden och se vad som blir kvar.",
  trustRow: [
    { label: "Skatteverket", url: "https://www.skatteverket.se/foretag.4.html" },
    { label: "Bolagsverket", url: "https://bolagsverket.se/" },
    { label: "Verksamt.se", url: "https://www.verksamt.se/" },
  ],
} as const;
