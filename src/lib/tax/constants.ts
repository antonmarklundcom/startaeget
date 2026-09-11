/**
 * The only place in the codebase where a rate, fee or threshold may live
 * (plan §4.16, §5.3). Everything else imports from here.
 *
 * `verified: false` means O3 could not open the authority's own page from the
 * build sandbox — the egress gateway answers 403 to CONNECT for
 * skatteverket.se, bolagsverket.se and verksamt.se alike (same block O1 hit on
 * the old WordPress site and O2 hit on the vendor price pages). Those values
 * were corroborated against independent secondary sources and carry the
 * authority URL in `source` so a human can check them in one click. They are
 * listed in `docs/log/O3.md` under Known issues.
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
    "https://www.skatteverket.se/privat/skatter/vardepapper/aktiebolag/utdelningochkapitalvinstpaandelarifamiljeforetag.4.3684199413c956649b5780c.html",
  moms: "https://www.skatteverket.se/foretag/moms/saljavarorochtjanster/momssatserpavarorochtjanster.4.58d555751259e4d661600f5.html",
  fskatt:
    "https://www.skatteverket.se/foretag/drivaforetag/startaochregistrera/godkannandeforfskatt.4.361dc8c15312eff6fd1f7cd.html",
  kommunalskatt:
    "https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/",
  bvAktiebolag:
    "https://bolagsverket.se/sjalvservice/avgifter/avgifterforaktiebolag.4642.html",
  bvEnskild:
    "https://bolagsverket.se/sjalvservice/avgifter/avgifterforenskildnaringsidkare.4648.html",
  bvHandelsbolag:
    "https://bolagsverket.se/sjalvservice/avgifter/avgifterforhandelsbolag.4646.html",
  aktiekapital:
    "https://bolagsverket.se/ff/foretagsformer/aktiebolag/starta/aktiekapital.1079.html",
} as const;

/**
 * Why the flagged values are flagged. Rendered once per result panel rather
 * than stamped onto every constant — the same paragraph repeated eight times
 * buries the tool it is meant to qualify.
 */
export const UNVERIFIED_EXPLANATION =
  "Värden märkta \u201Cverifiera\u201D är kontrollerade mot flera oberoende andrahandskällor, men inte mot myndighetens egen sida — byggmiljön når inte ut till skatteverket.se, bolagsverket.se eller verksamt.se. Klicka på källan och kontrollera själv innan du fattar ett beslut som hänger på siffran.";

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
  }),
  c({
    key: "egenavgifter",
    value: 28.97,
    unit: "percent",
    label: "Egenavgifter på överskottet i enskild firma",
    validFrom: "2026-01-01",
    source: SV_SOURCES.egenavgifter,
    note: `Full avgift för dig som är under 66 år; lägre om du är äldre eller har hel pension.`,
  }),
  c({
    key: "egenavgifter-schablonavdrag",
    value: 25,
    unit: "percent",
    label: "Schablonavdrag för egenavgifter i näringsbilagan",
    validFrom: "2026-01-01",
    source: SV_SOURCES.egenavgifter,
    note: `25 % gäller aktiv näringsverksamhet; 10 % för vissa äldre årskullar.`,
  }),
  c({
    key: "arbetsgivaravgifter",
    value: 31.42,
    unit: "percent",
    label: "Arbetsgivaravgifter på lön du tar ut från ditt aktiebolag",
    validFrom: "2026-01-01",
    source: SV_SOURCES.arbetsgivaravgifter,
  }),

  // ——— Inkomstskatt på lön och överskott ———
  c({
    key: "kommunalskatt-genomsnitt",
    value: 32.38,
    unit: "percent",
    label: "Genomsnittlig kommunalskatt i Sverige (riksgenomsnitt)",
    validFrom: "2026-01-01",
    source: SV_SOURCES.kommunalskatt,
    note: `Riksgenomsnitt. Din egen kommun ligger mellan cirka 28,9 % och 35,7 % — räkna om med din egen skattesats.`,
  }),
  c({
    key: "statlig-skatt",
    value: 20,
    unit: "percent",
    label: "Statlig inkomstskatt över brytpunkten",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
  }),
  c({
    key: "brytpunkt-statlig-skatt",
    value: 660_400,
    unit: "sek",
    label: "Brytpunkt för statlig inkomstskatt (lön före skatt, under 66 år)",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
    note: `Brytpunkten är skiktgränsen plus grundavdraget; skiktgränsen för 2026 anges till 643 000 kr.`,
  }),
  c({
    key: "skiktgrans",
    value: 643_000,
    unit: "sek",
    label: "Skiktgräns — beskattningsbar inkomst där statlig skatt börjar",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
  }),
  c({
    key: "prisbasbelopp",
    value: 59_200,
    unit: "sek",
    label: "Prisbasbelopp",
    validFrom: "2026-01-01",
    source: SV_SOURCES.beloppOchProcent,
  }),
  c({
    key: "inkomstbasbelopp",
    value: 80_600,
    unit: "sek",
    label: "Inkomstbasbelopp för 2025, som 2026 års utdelningsutrymme räknas på",
    validFrom: "2025-01-01",
    source: SV_SOURCES.utdelning,
  }),

  // ——— Utdelning (3:12) ———
  c({
    key: "utdelning-grundbelopp",
    value: 322_400,
    unit: "sek",
    label: "Grundbelopp för lågbeskattad utdelning (4 inkomstbasbelopp)",
    validFrom: "2026-01-01",
    source: SV_SOURCES.utdelning,
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
  }),

  // ——— Moms ———
  c({
    key: "moms-normal",
    value: 25,
    unit: "percent",
    label: "Moms, normalskattesats",
    validFrom: "1990-07-01",
    source: SV_SOURCES.moms,
  }),
  c({
    key: "moms-livsmedel",
    value: 12,
    unit: "percent",
    label: "Moms på livsmedel, hotell och restaurang",
    validFrom: "2012-01-01",
    source: SV_SOURCES.moms,
  }),
  c({
    key: "moms-kultur",
    value: 6,
    unit: "percent",
    label: "Moms på böcker, tidningar, persontransport och kultur",
    validFrom: "2002-01-01",
    source: SV_SOURCES.moms,
  }),

  // ——— Avgifter vid start ———
  c({
    key: "aktiekapital-minimum",
    value: 25_000,
    unit: "sek",
    label: "Lägsta aktiekapital i ett privat aktiebolag",
    validFrom: "2020-01-01",
    source: SV_SOURCES.aktiekapital,
    note: `Pengarna är inte en avgift — de blir bolagets egna och får användas i verksamheten.`,
  }),
  c({
    key: "bolagsverket-ab-nyregistrering",
    value: 2_200,
    unit: "sek",
    label: "Bolagsverkets avgift för att nyregistrera aktiebolag via e-tjänst",
    validFrom: "2025-06-19",
    source: SV_SOURCES.bvAktiebolag,
    note: `Avgifterna höjdes 19 juni 2025. På pappersblankett anges 2 900 kr.`,
  }),
  c({
    key: "bolagsverket-ab-nyregistrering-blankett",
    value: 2_900,
    unit: "sek",
    label: "Samma registrering på pappersblankett",
    validFrom: "2025-06-19",
    source: SV_SOURCES.bvAktiebolag,
  }),
  c({
    key: "bolagsverket-enskild-firma",
    value: 1_200,
    unit: "sek",
    label: "Bolagsverkets avgift för att registrera enskild firma (frivilligt)",
    validFrom: "2025-06-19",
    source: SV_SOURCES.bvEnskild,
    note: `Frivilligt för enskild firma — du behöver det bara om du vill skydda företagsnamnet. F-skatt och moms registrerar du gratis hos Skatteverket.`,
  }),
  c({
    key: "bolagsverket-handelsbolag",
    value: 1_200,
    unit: "sek",
    label: "Bolagsverkets avgift för att registrera handelsbolag",
    validFrom: "2025-06-19",
    source: SV_SOURCES.bvHandelsbolag,
  }),
  c({
    key: "bolagsverket-andring-styrelse",
    value: 800,
    unit: "sek",
    label: "Ändra styrelse, vd eller revisor via e-tjänst",
    validFrom: "2025-06-19",
    source: SV_SOURCES.bvAktiebolag,
  }),
  c({
    key: "fskatt",
    value: 0,
    unit: "sek",
    label: "Godkännande för F-skatt hos Skatteverket",
    validFrom: "2020-01-01",
    source: SV_SOURCES.fskatt,
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
