/**
 * The only place in the codebase where a rate, fee or threshold may live
 * (plan §4.16, §5.3). Everything else imports from here.
 *
 * Verification status: every entry below was checked against the authority's
 * own live page on skatteverket.se or bolagsverket.se, by a human browsing
 * them directly (all on 2026-09-16, `moms-kultur` on a later follow-up the
 * same day). The earlier note in this header — that the build sandbox got
 * 403 on CONNECT to skatteverket.se, bolagsverket.se and verksamt.se, so O3
 * had to fall back on secondary sources — no longer describes any entry.
 *
 * One honest caveat on that pass: six figures (`egenavgifter`,
 * `egenavgifter-schablonavdrag`, `arbetsgivaravgifter`, `bolagsskatt`,
 * `kommunalskatt-genomsnitt`, `fskatt`) were confirmed on Skatteverket's
 * "Belopp och procent 2026" summary page, not on the topic page each one
 * carries in `source`. The number is verified; that particular link was not
 * re-opened in the pass.
 *
 * Several `source` URLs had 404'd since the last pass (Skatteverket and
 * Bolagsverket both restructured their URLs) and were replaced with the live
 * ones found on 2026-09-16.
 *
 * To correct a value: edit it here, set `verifiedOn` to the date you checked it
 * and flip `verified` to true. Nothing else needs to change.
 */

export type Unit = "percent" | "sek" | "sek-per-month" | "count";

export type TaxConstant = {
  /** Stable identifier; also the lookup key. */
  key: string;
  value: number;
  unit: Unit;
  /** What the figure applies to, in the site's own words (du-form, Swedish). */
  label: string;
  /** First day the value applies, ISO. Income-year values use 1 January. */
  validFrom: string;
  /** The authority's own page for this figure. Rendered as the source link. */
  source: string;
  /** Date O3 (or a later human) checked it against `source`. Null = never. */
  verifiedOn: string | null;
  /** False until someone has opened `source` and seen this number. */
  verified: boolean;
  /** Why it is still unverified, or anything a reader needs to know. */
  note?: string;
};

const SV_SOURCES = {
  beloppOchProcent:
    "https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html",
  egenavgifter:
    "https://www.skatteverket.se/foretag/drivaforetag/foretagsformer/enskildnaringsverksamhet/egenavgifter.4.361dc8c15312eff6fd1f678.html",
  arbetsgivaravgifter:
    "https://www.skatteverket.se/foretag/arbetsgivare/arbetsgivaravgifterochskatteavdrag.4.233f91f71260075abe8800020817.html",
  bolagsskatt:
    "https://www.skatteverket.se/foretag/drivaforetag/foretagsformer/aktiebolag.4.361dc8c15312eff6fd1f7ba.html",
  utdelning:
    "https://www.skatteverket.se/foretag/drivaforetag/foretagsformer/famansforetag/andradereglerinforinkomstdeklarationen2027.4.4a54dc8b19aa6175a152359.html",
  moms: "https://www.skatteverket.se/foretag/moms/saljavarorochtjanster/momssatserochundantagfranmoms.4.58d555751259e4d66168000409.html",
  fskatt:
    "https://www.skatteverket.se/foretag/drivaforetag/startaochregistrera/godkannandeforfskatt.4.361dc8c15312eff6fd1f7cd.html",
  kommunalskatt:
    "https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/",
  bvAktiebolag:
    "https://bolagsverket.se/sjalvservice/avgifter/avgifterforaktiebolag.4358.html",
  bvEnskild:
    "https://bolagsverket.se/sjalvservice/avgifter/avgifterforenskildnaringsverksamhet.4360.html",
  bvHandelsbolag:
    "https://bolagsverket.se/sjalvservice/avgifter/avgifterforhandelsbolag.4362.html",
  aktiekapital:
    "https://bolagsverket.se/foretag/aktiebolag/startaaktiebolag/aktier.497.html",
} as const;

/** ISO date of the live-browsing verification pass documented in the header. */
const VERIFIED_ON = "2026-09-16";

/**
 * Bolagsverket raised these five fees again some time after the dated
 * 19 June 2025 increase, but their avgiftssidor do not state when the new
 * amounts took effect. Rather than invent a date, `validFrom` on those entries
 * is the day the amount was seen on the page.
 */
const BV_FEE_NOTE =
  "Bolagsverket har höjt avgiften igen efter höjningen 19 juni 2025, men anger inget datum för när det nya beloppet började gälla. Datumet här är därför dagen beloppet lästes av på Bolagsverkets avgiftssida, inte nödvändigtvis dagen det började gälla.";

/**
 * Why the flagged values are flagged. Rendered once per result panel rather
 * than stamped onto every constant — the same paragraph repeated eight times
 * buries the tool it is meant to qualify.
 */
export const UNVERIFIED_EXPLANATION =
  "Värden märkta \u201Cverifiera\u201D är kontrollerade mot oberoende andrahandskällor och ingick inte i kontrollen mot myndigheternas egna sidor den 16 september 2026. Klicka på källan och kontrollera själv innan du fattar ett beslut som hänger på siffran.";

function c(input: Omit<TaxConstant, "verified" | "verifiedOn"> & {
  verified?: boolean;
  verifiedOn?: string | null;
}): TaxConstant {
  return {
    ...input,
    verified: input.verified ?? false,
    verifiedOn: input.verifiedOn ?? null,
  };
}

export const TAX_YEAR = 2026;

export const constants: TaxConstant[] = [
  // ——— Företagsskatt ———
  c({
    key: "bolagsskatt",
    value: 20.6,
    unit: "percent",
    label: "Bolagsskatt på aktiebolagets vinst",
    validFrom: "2021-01-01",
    source: SV_SOURCES.bolagsskatt,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),
  c({
    key: "egenavgifter",
    value: 28.97,
    unit: "percent",
    label: "Egenavgifter på överskottet i enskild firma",
    validFrom: "2026-01-01",
    source: SV_SOURCES.egenavgifter,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Full avgift för dig som är under 66 år; lägre om du är äldre eller har hel pension.`,
  }),
  c({
    key: "egenavgifter-schablonavdrag",
    value: 25,
    unit: "percent",
    label: "Schablonavdrag för egenavgifter i näringsbilagan",
    validFrom: "2026-01-01",
    source: SV_SOURCES.egenavgifter,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `25 % gäller aktiv näringsverksamhet; 10 % för vissa äldre årskullar.`,
  }),
  c({
    key: "arbetsgivaravgifter",
    value: 31.42,
    unit: "percent",
    label: "Arbetsgivaravgifter på lön du tar ut från ditt aktiebolag",
    validFrom: "2026-01-01",
    source: SV_SOURCES.arbetsgivaravgifter,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),

  // ——— Inkomstskatt på lön och överskott ———
  c({
    key: "kommunalskatt-genomsnitt",
    value: 32.38,
    unit: "percent",
    label: "Genomsnittlig kommunalskatt i Sverige (riksgenomsnitt)",
    validFrom: "2026-01-01",
    source: SV_SOURCES.kommunalskatt,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Riksgenomsnitt. Din egen kommun ligger mellan cirka 28,9 % och 35,7 % — räkna om med din egen skattesats.`,
  }),
  c({
    key: "statlig-skatt",
    value: 20,
    unit: "percent",
    label: "Statlig inkomstskatt över brytpunkten",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),
  c({
    key: "brytpunkt-statlig-skatt",
    value: 660_400,
    unit: "sek",
    label: "Brytpunkt för statlig inkomstskatt (lön före skatt, under 66 år)",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Brytpunkten är skiktgränsen plus grundavdraget; skiktgränsen för 2026 anges till 643 000 kr.`,
  }),
  c({
    key: "skiktgrans",
    value: 643_000,
    unit: "sek",
    label: "Skiktgräns — beskattningsbar inkomst där statlig skatt börjar",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),
  c({
    key: "prisbasbelopp",
    value: 59_200,
    unit: "sek",
    label: "Prisbasbelopp",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),
  c({
    key: "inkomstbasbelopp",
    value: 80_600,
    unit: "sek",
    label: "Inkomstbasbelopp för 2025, som 2026 års utdelningsutrymme räknas på",
    validFrom: "2025-01-01",
    source: SV_SOURCES.utdelning,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),

  // ——— Utdelning (3:12) ———
  c({
    key: "utdelning-grundbelopp",
    value: 322_400,
    unit: "sek",
    label: "Grundbelopp för lågbeskattad utdelning (4 inkomstbasbelopp)",
    validFrom: "2026-01-01",
    source: SV_SOURCES.utdelning,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note:
      `Från 2026 ersätts förenklingsregeln och huvudregeln av en gemensam regel med ett grundbelopp på 4 inkomstbasbelopp, som delas mellan delägarna. Reformen är ny — kontrollera mot Skatteverket innan du planerar en utdelning.`,
  }),
  c({
    key: "utdelningsskatt",
    value: 20,
    unit: "percent",
    label: "Skatt på utdelning inom gränsbeloppet",
    validFrom: "2026-01-01",
    source: SV_SOURCES.utdelning,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),

  // ——— Moms ———
  // Tre satser, men fyra fakta sedan 1 april 2026: livsmedel bröts ut ur
  // 12-procentsgruppen och ligger nu på 6 %, medan restaurang, catering och
  // hotell är kvar på 12 %. Därför en egen konstant för vardera.
  c({
    key: "moms-normal",
    value: 25,
    unit: "percent",
    label: "Moms, normalskattesats",
    validFrom: "1990-07-01",
    source: SV_SOURCES.moms,
    verified: true,
    verifiedOn: VERIFIED_ON,
  }),
  c({
    key: "moms-restaurang",
    value: 12,
    unit: "percent",
    label: "Moms på restaurang- och cateringtjänster samt hotell",
    validFrom: "2012-01-01",
    source: SV_SOURCES.moms,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Satsen ändrades inte när livsmedelsmomsen sänktes 1 april 2026 — restaurangtjänster ligger kvar på 12 %. Alkoholhaltig dryck som förtärs på plats har fortfarande 25 %.`,
  }),
  c({
    key: "moms-livsmedel",
    value: 6,
    unit: "percent",
    label: "Moms på livsmedel (mat i butik och hämtmat)",
    validFrom: "2026-04-01",
    source: SV_SOURCES.moms,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Sänkt från 12 % till 6 % den 1 april 2026. Sänkningen gäller livsmedel — mat som serveras som restaurangtjänst ligger kvar på 12 %.`,
  }),
  c({
    key: "moms-kultur",
    value: 6,
    unit: "percent",
    label: "Moms på böcker, tidningar, persontransport och kultur",
    validFrom: "2002-01-01",
    source: SV_SOURCES.moms,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: "Skatteverkets egen sida bekräftar 6 % på böcker/tidningar, persontransport inom Sverige och entré till t.ex. konserter och djurparker. Vissa kulturtjänster (t.ex. dans- och musikframträdanden sålda av utövaren själv, museientré när museet drivs av stat/region/kommun) är i stället momsfria snarare än 6 % — den nyansen ligger utanför denna enskilda konstant.",
  }),

  // ——— Avgifter vid start ———
  c({
    key: "aktiekapital-minimum",
    value: 25_000,
    unit: "sek",
    label: "Lägsta aktiekapital i ett privat aktiebolag",
    validFrom: "2020-01-01",
    source: SV_SOURCES.aktiekapital,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Pengarna är inte en avgift — de blir bolagets egna och får användas i verksamheten.`,
  }),
  c({
    key: "bolagsverket-ab-nyregistrering",
    value: 2_400,
    unit: "sek",
    label: "Bolagsverkets avgift för att nyregistrera aktiebolag via e-tjänst",
    validFrom: VERIFIED_ON,
    source: SV_SOURCES.bvAktiebolag,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `På pappersblankett anges 2 700 kr. ${BV_FEE_NOTE}`,
  }),
  c({
    key: "bolagsverket-ab-nyregistrering-blankett",
    value: 2_700,
    unit: "sek",
    label: "Samma registrering på pappersblankett",
    validFrom: VERIFIED_ON,
    source: SV_SOURCES.bvAktiebolag,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: BV_FEE_NOTE,
  }),
  c({
    key: "bolagsverket-enskild-firma",
    value: 1_800,
    unit: "sek",
    label: "Bolagsverkets avgift för att registrera enskild firma (frivilligt)",
    validFrom: VERIFIED_ON,
    source: SV_SOURCES.bvEnskild,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: `Frivilligt för enskild firma — du behöver det bara om du vill skydda företagsnamnet. F-skatt och moms registrerar du gratis hos Skatteverket. ${BV_FEE_NOTE}`,
  }),
  c({
    key: "bolagsverket-handelsbolag",
    value: 1_800,
    unit: "sek",
    label: "Bolagsverkets avgift för att registrera handelsbolag",
    validFrom: VERIFIED_ON,
    source: SV_SOURCES.bvHandelsbolag,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: BV_FEE_NOTE,
  }),
  c({
    key: "bolagsverket-andring-styrelse",
    value: 1_000,
    unit: "sek",
    label: "Ändra styrelse, vd eller revisor via e-tjänst",
    validFrom: VERIFIED_ON,
    source: SV_SOURCES.bvAktiebolag,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: BV_FEE_NOTE,
  }),
  c({
    key: "fskatt",
    value: 0,
    unit: "sek",
    label: "Godkännande för F-skatt hos Skatteverket",
    validFrom: "2020-01-01",
    source: SV_SOURCES.fskatt,
    verified: true,
    verifiedOn: VERIFIED_ON,
    note: "F-skatt, momsregistrering och arbetsgivarregistrering kostar ingenting.",
  }),
];

const byKey = new Map(constants.map((item) => [item.key, item]));

if (byKey.size !== constants.length) {
  throw new Error("src/lib/tax/constants.ts: duplicate constant key");
}

/** Throws on an unknown key so a typo fails the build, not a calculation. */
export function constant(key: string): TaxConstant {
  const found = byKey.get(key);
  if (!found) throw new Error(`Unknown tax constant "${key}"`);
  return found;
}

/** The bare number. Use in math; use `constant()` when you need the source too. */
export function value(key: string): number {
  return constant(key).value;
}

/** A percent constant as a multiplier, e.g. 20.6 → 0.206. */
export function rate(key: string): number {
  const item = constant(key);
  if (item.unit !== "percent") {
    throw new Error(`Tax constant "${key}" is ${item.unit}, not a percentage`);
  }
  return item.value / 100;
}

/** Everything a result panel needs to show its sources honestly. */
export function sourcesFor(keys: readonly string[]): TaxConstant[] {
  return keys.map(constant);
}

export const unverifiedConstants = (): TaxConstant[] =>
  constants.filter((item) => !item.verified);
