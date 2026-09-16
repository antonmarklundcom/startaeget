/**
 * Partner registry (plan §2.3). One entry per slot we may recommend.
 *
 * `affiliateUrl` stays empty until the program is enrolled (§7 item 5). Until
 * then `/go/<id>` logs the click and redirects to `fallback`, so nothing on the
 * site is ever a dead link and no page has to be edited when a program lands.
 *
 * No prices or terms live here — those belong in the article's `sources` or in
 * src/lib/tax/constants.ts with a date (§4.16).
 */

export type PartnerCategory =
  | "bokforingsprogram"
  | "foretagskonto"
  | "webbhotell"
  | "foretagsforsakring"
  | "ehandel"
  | "kassasystem"
  | "bolagsbildning"
  | "foretagslan"
  | "redovisningsbyra";

export type Partner = {
  id: string;
  name: string;
  category: PartnerCategory;
  /** The partner's own page we send people to. */
  url: string;
  /** Tracking link from Adtraction/Adrecord/Tradedoubler or a direct program. */
  affiliateUrl?: string;
  /** Shown inline next to the link, required by Swedish marketing law (§1.2). */
  disclosure: string;
  cta: string;
  /** Plain, non-affiliate link used whenever `affiliateUrl` is empty. */
  fallback: string;
};

const ANNONS = "Annonslänk";
const PLAIN = "Vi tjänar inget på den här länken";

export const partners: Partner[] = [
  // --- Bokföringsprogram ----------------------------------------------------
  {
    id: "bokio",
    name: "Bokio",
    category: "bokforingsprogram",
    url: "https://www.bokio.se/",
    disclosure: ANNONS,
    cta: "Till Bokio",
    fallback: "https://www.bokio.se/",
  },
  {
    id: "fortnox",
    name: "Fortnox",
    category: "bokforingsprogram",
    url: "https://www.fortnox.se/",
    disclosure: ANNONS,
    cta: "Till Fortnox",
    fallback: "https://www.fortnox.se/",
  },
  {
    // The product rebranded from "Visma eEkonomi" to "Spiris" (vendor's own
    // wording, verified 2026-09-16 on spiris.se: "Bokföringsprogrammet Visma
    // eEkonomi har bytt namn till Spiris"). The `id` is deliberately kept as
    // `visma-eekonomi` because /go/visma-eekonomi/ is a stable public URL, and
    // the display name keeps the old name in parentheses because that is still
    // what people search for.
    id: "visma-eekonomi",
    name: "Spiris (f.d. Visma eEkonomi)",
    category: "bokforingsprogram",
    url: "https://www.spiris.se/ekonomiplattform/bokforing-fakturering",
    disclosure: ANNONS,
    cta: "Till Spiris",
    fallback: "https://www.spiris.se/ekonomiplattform/bokforing-fakturering",
  },
  {
    id: "wint",
    name: "Wint",
    category: "bokforingsprogram",
    url: "https://www.wint.se/",
    disclosure: ANNONS,
    cta: "Till Wint",
    fallback: "https://www.wint.se/",
  },
  {
    id: "bjorn-lunden",
    name: "Björn Lundén",
    category: "bokforingsprogram",
    url: "https://www.bjornlunden.se/",
    disclosure: ANNONS,
    cta: "Till Björn Lundén",
    fallback: "https://www.bjornlunden.se/",
  },

  // --- Företagskonto och bank ----------------------------------------------
  {
    id: "seb-foretag",
    name: "SEB Företag",
    category: "foretagskonto",
    url: "https://seb.se/foretag",
    disclosure: PLAIN,
    cta: "Till SEB",
    fallback: "https://seb.se/foretag",
  },
  {
    id: "swedbank-foretag",
    name: "Swedbank Företag",
    category: "foretagskonto",
    url: "https://www.swedbank.se/foretag.html",
    disclosure: PLAIN,
    cta: "Till Swedbank",
    fallback: "https://www.swedbank.se/foretag.html",
  },
  {
    id: "nordea-foretag",
    name: "Nordea Företag",
    category: "foretagskonto",
    url: "https://www.nordea.se/foretag/",
    disclosure: PLAIN,
    cta: "Till Nordea",
    fallback: "https://www.nordea.se/foretag/",
  },
  {
    id: "handelsbanken-foretag",
    name: "Handelsbanken Företag",
    category: "foretagskonto",
    url: "https://www.handelsbanken.se/sv/foretag",
    disclosure: PLAIN,
    cta: "Till Handelsbanken",
    fallback: "https://www.handelsbanken.se/sv/foretag",
  },

  // --- Webbhotell och domän -------------------------------------------------
  {
    id: "loopia",
    name: "Loopia",
    category: "webbhotell",
    url: "https://www.loopia.se/",
    disclosure: ANNONS,
    cta: "Till Loopia",
    fallback: "https://www.loopia.se/",
  },
  {
    id: "one-com",
    name: "One.com",
    category: "webbhotell",
    url: "https://www.one.com/sv/",
    disclosure: ANNONS,
    cta: "Till One.com",
    fallback: "https://www.one.com/sv/",
  },
  {
    id: "hostinger",
    name: "Hostinger",
    category: "webbhotell",
    url: "https://www.hostinger.se/",
    disclosure: ANNONS,
    cta: "Till Hostinger",
    fallback: "https://www.hostinger.se/",
  },
  {
    id: "miss-hosting",
    name: "Miss Hosting",
    category: "webbhotell",
    url: "https://misshosting.se/",
    disclosure: ANNONS,
    cta: "Till Miss Hosting",
    fallback: "https://misshosting.se/",
  },

  // --- Företagsförsäkring ---------------------------------------------------
  {
    id: "if-foretag",
    name: "If Företagsförsäkring",
    category: "foretagsforsakring",
    url: "https://www.if.se/foretag",
    disclosure: ANNONS,
    cta: "Till If",
    fallback: "https://www.if.se/foretag",
  },
  {
    id: "trygg-hansa-foretag",
    name: "Trygg-Hansa Företag",
    category: "foretagsforsakring",
    url: "https://www.trygghansa.se/foretag",
    disclosure: ANNONS,
    cta: "Till Trygg-Hansa",
    fallback: "https://www.trygghansa.se/foretag",
  },
  {
    id: "lansforsakringar-foretag",
    name: "Länsförsäkringar Företag",
    category: "foretagsforsakring",
    url: "https://www.lansforsakringar.se/foretag/",
    disclosure: PLAIN,
    cta: "Till Länsförsäkringar",
    fallback: "https://www.lansforsakringar.se/foretag/",
  },

  // --- E-handel och kassasystem --------------------------------------------
  {
    id: "shopify",
    name: "Shopify",
    category: "ehandel",
    url: "https://www.shopify.com/se",
    disclosure: ANNONS,
    cta: "Till Shopify",
    fallback: "https://www.shopify.com/se",
  },
  {
    id: "wikinggruppen",
    name: "Wikinggruppen",
    category: "ehandel",
    url: "https://www.wikinggruppen.se/",
    disclosure: ANNONS,
    cta: "Till Wikinggruppen",
    fallback: "https://www.wikinggruppen.se/",
  },
  {
    id: "quickbutik",
    name: "Quickbutik",
    category: "ehandel",
    url: "https://www.quickbutik.com/",
    disclosure: ANNONS,
    cta: "Till Quickbutik",
    fallback: "https://www.quickbutik.com/",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    category: "ehandel",
    url: "https://woocommerce.com/",
    disclosure: PLAIN,
    cta: "Till WooCommerce",
    fallback: "https://woocommerce.com/",
  },
  {
    id: "zettle",
    name: "Zettle",
    category: "kassasystem",
    url: "https://www.zettle.com/se",
    disclosure: ANNONS,
    cta: "Till Zettle",
    fallback: "https://www.zettle.com/se",
  },

  // --- Bolagsbildning och lagerbolag ---------------------------------------
  {
    id: "standardbolag",
    name: "Standardbolag",
    category: "bolagsbildning",
    url: "https://www.standardbolag.se/",
    disclosure: ANNONS,
    cta: "Till Standardbolag",
    fallback: "https://www.standardbolag.se/",
  },
  {
    id: "bolagsstiftarna",
    name: "Bolagsstiftarna",
    category: "bolagsbildning",
    url: "https://www.bolagsstiftarna.se/",
    disclosure: ANNONS,
    cta: "Till Bolagsstiftarna",
    fallback: "https://www.bolagsstiftarna.se/",
  },
  {
    id: "heinestams",
    name: "Heinestams",
    category: "bolagsbildning",
    url: "https://www.heinestams.se/",
    disclosure: ANNONS,
    cta: "Till Heinestams",
    fallback: "https://www.heinestams.se/",
  },

  // --- Företagslån ----------------------------------------------------------
  {
    id: "qred",
    name: "Qred",
    category: "foretagslan",
    url: "https://www.qred.com/se",
    disclosure: ANNONS,
    cta: "Till Qred",
    fallback: "https://www.qred.com/se",
  },
  {
    id: "froda",
    name: "Froda",
    category: "foretagslan",
    url: "https://froda.se/",
    disclosure: ANNONS,
    cta: "Till Froda",
    fallback: "https://froda.se/",
  },
];
