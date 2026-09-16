import { value } from "./constants";
import type { CompanyForm } from "./bolagsform";

/**
 * Tool 2, Startkostnadskalkylatorn (plan §5.3): every krona you actually pay to
 * get going, split into "att betala vid start" and "per månad första året".
 *
 * Defaults come from constants where an authority sets them and from ranges
 * where the market sets them. A range default is the middle of the range and
 * says so, because a made-up exact price is worse than an honest interval.
 */

export type CostKind = "once" | "monthly";

export type LineItem = {
  id: string;
  label: string;
  kind: CostKind;
  /** Pre-filled amount in kronor. The visitor can change every one of them. */
  default: number;
  /** Set when the default is the middle of an observed market range. */
  range?: { low: number; high: number };
  /** Which forms this line applies to. Omitted = all. */
  forms?: CompanyForm[];
  /** Off by default; the visitor ticks it on. */
  optional?: boolean;
  /** Constant key backing the default, when one does. */
  constantKey?: string;
  /** Partner slot sold against this line (ids from content/affiliates.ts). */
  partners?: string[];
  help: string;
};

/** Market-price lines. Unverifiable in the sandbox, so they ship as ranges. */
const RANGE_NOTE =
  "Marknadspris, inte en myndighetsavgift — intervallet är vad leverantörerna listar. Kontrollera hos leverantören.";

export const LINE_ITEMS: LineItem[] = [
  {
    id: "registrering-ab",
    label: "Bolagsverket, nyregistrering av aktiebolag",
    kind: "once",
    default: value("bolagsverket-ab-nyregistrering"),
    forms: ["ab"],
    constantKey: "bolagsverket-ab-nyregistrering",
    help: "Avgiften via e-tjänsten på verksamt.se. På pappersblankett kostar det 2 700 kr.",
  },
  {
    id: "registrering-handelsbolag",
    label: "Bolagsverket, registrering av handelsbolag",
    kind: "once",
    default: value("bolagsverket-handelsbolag"),
    forms: ["handelsbolag"],
    constantKey: "bolagsverket-handelsbolag",
    help: "Obligatoriskt för handelsbolag.",
  },
  {
    id: "registrering-enskild",
    label: "Bolagsverket, skydda företagsnamnet",
    kind: "once",
    default: value("bolagsverket-enskild-firma"),
    forms: ["enskild"],
    optional: true,
    constantKey: "bolagsverket-enskild-firma",
    help: "Frivilligt för enskild firma. Du behöver det bara om du vill ha namnet skyddat i ditt län.",
  },
  {
    id: "aktiekapital",
    label: "Aktiekapital",
    kind: "once",
    default: value("aktiekapital-minimum"),
    forms: ["ab"],
    constantKey: "aktiekapital-minimum",
    help:
      "Inte en avgift — pengarna blir bolagets egna och får användas i verksamheten. Men de måste finnas på kontot vid start.",
  },
  {
    id: "fskatt",
    label: "F-skatt och momsregistrering",
    kind: "once",
    default: 0,
    constantKey: "fskatt",
    help: "Kostar ingenting hos Skatteverket, oavsett bolagsform.",
  },
  {
    id: "foretagskonto",
    label: "Företagskonto, startavgift",
    kind: "once",
    default: 0,
    range: { low: 0, high: 1_500 },
    partners: ["seb-foretag", "swedbank-foretag", "nordea-foretag"],
    help: `De flesta digitala aktörerna tar inget för att öppna kontot; storbankerna kan ta en avgift för bankintyget till aktiebolaget. ${RANGE_NOTE}`,
  },
  {
    id: "foretagskonto-manad",
    label: "Företagskonto, månadsavgift",
    kind: "monthly",
    default: 75,
    range: { low: 0, high: 150 },
    partners: ["seb-foretag", "swedbank-foretag"],
    help: `Vanligt spann för ett enkelt företagskonto. ${RANGE_NOTE}`,
  },
  {
    id: "bokforingsprogram",
    label: "Bokföringsprogram",
    kind: "monthly",
    default: 200,
    range: { low: 0, high: 400 },
    partners: ["bokio", "fortnox", "visma-eekonomi", "wint"],
    help: `Från gratis grundnivå till några hundralappar i månaden med fakturering och lön. ${RANGE_NOTE}`,
  },
  {
    id: "byra",
    label: "Redovisningsbyrå",
    kind: "monthly",
    default: 1_500,
    range: { low: 800, high: 3_500 },
    optional: true,
    help: `Löpande bokföring för ett litet bolag. Bokslut och deklaration tillkommer ofta som en årsavgift. ${RANGE_NOTE}`,
  },
  {
    id: "forsakring",
    label: "Företagsförsäkring",
    kind: "monthly",
    default: 250,
    range: { low: 100, high: 600 },
    partners: ["if-foretag", "trygg-hansa-foretag", "lansforsakringar-foretag"],
    help: `Beror helt på bransch. Ansvarsförsäkring är billig; sak- och avbrottsförsäkring kostar mer. ${RANGE_NOTE}`,
  },
  {
    id: "doman",
    label: "Domännamn",
    kind: "once",
    default: 150,
    range: { low: 100, high: 300 },
    partners: ["loopia", "one-com"],
    help: `Ett .se-domännamn per år. ${RANGE_NOTE}`,
  },
  {
    id: "webbhotell",
    label: "Webbhotell",
    kind: "monthly",
    default: 80,
    range: { low: 30, high: 200 },
    partners: ["loopia", "hostinger", "one-com", "miss-hosting"],
    help: `Enkelt webbhotell för en hemsida. ${RANGE_NOTE}`,
  },
  {
    id: "ehandel",
    label: "E-handelsplattform",
    kind: "monthly",
    default: 350,
    range: { low: 0, high: 900 },
    optional: true,
    partners: ["shopify", "quickbutik", "wikinggruppen"],
    help: `Bara om du ska sälja i en webbshop. ${RANGE_NOTE}`,
  },
  {
    id: "kassasystem",
    label: "Kassasystem eller kortterminal",
    kind: "once",
    default: 0,
    range: { low: 0, high: 2_500 },
    optional: true,
    partners: ["zettle"],
    help: `Bara om du tar betalt på plats. ${RANGE_NOTE}`,
  },
  {
    id: "utrustning",
    label: "Utrustning och material",
    kind: "once",
    default: 0,
    optional: true,
    help: "Dator, verktyg, första varulagret — det du behöver ha innan du kan sälja något. Bara du vet den här.",
  },
  {
    id: "marknadsforing",
    label: "Marknadsföring",
    kind: "monthly",
    default: 0,
    optional: true,
    help: "Annonsbudget, visitkort, skyltar. Börja lågt och öka när du vet vad som fungerar.",
  },
];

export type Selection = {
  form: CompanyForm;
  /** id → amount in kronor. Missing = use the default. */
  amounts: Record<string, number>;
  /** Ids of optional lines the visitor switched on. */
  enabled: string[];
};

export function itemsForForm(form: CompanyForm): LineItem[] {
  return LINE_ITEMS.filter((item) => !item.forms || item.forms.includes(form));
}

/** The lines actually counted: mandatory ones, plus the optional ones ticked. */
export function activeItems(selection: Selection): LineItem[] {
  return itemsForForm(selection.form).filter(
    (item) => !item.optional || selection.enabled.includes(item.id),
  );
}

export function amountFor(item: LineItem, selection: Selection): number {
  const override = selection.amounts[item.id];
  if (typeof override === "number" && Number.isFinite(override) && override >= 0) {
    return Math.round(override);
  }
  return item.default;
}

export type StartCostTotals = {
  /** Paid before you can invoice anything. */
  once: number;
  /** Recurring, per month. */
  monthly: number;
  /** once + 12 × monthly. */
  firstYear: number;
  /** Aktiekapital is not a cost — it stays yours. Shown separately. */
  ofWhichAktiekapital: number;
  /** once minus aktiekapital: what you never see again. */
  onceExcludingCapital: number;
  lines: { item: LineItem; amount: number }[];
};

export function totals(selection: Selection): StartCostTotals {
  const lines = activeItems(selection).map((item) => ({
    item,
    amount: amountFor(item, selection),
  }));

  const once = lines
    .filter((line) => line.item.kind === "once")
    .reduce((sum, line) => sum + line.amount, 0);
  const monthly = lines
    .filter((line) => line.item.kind === "monthly")
    .reduce((sum, line) => sum + line.amount, 0);
  const ofWhichAktiekapital =
    lines.find((line) => line.item.id === "aktiekapital")?.amount ?? 0;

  return {
    once,
    monthly,
    firstYear: once + monthly * 12,
    ofWhichAktiekapital,
    onceExcludingCapital: once - ofWhichAktiekapital,
    lines,
  };
}

export function defaultSelection(form: CompanyForm = "ab"): Selection {
  return { form, amounts: {}, enabled: [] };
}

/** URL state: form, the ticked optional lines and only the edited amounts. */
export function toQuery(selection: Selection): string {
  const params = new URLSearchParams();
  params.set("form", selection.form);
  if (selection.enabled.length) params.set("extra", selection.enabled.join(","));
  const edited = Object.entries(selection.amounts)
    .filter(([id, amount]) => {
      const item = LINE_ITEMS.find((candidate) => candidate.id === id);
      return item && Number.isFinite(amount) && amount !== item.default;
    })
    .map(([id, amount]) => `${id}:${Math.round(amount)}`);
  if (edited.length) params.set("belopp", edited.join(","));
  return params.toString();
}

export function fromQuery(params: URLSearchParams): Selection {
  const rawForm = params.get("form");
  const form: CompanyForm =
    rawForm === "enskild" || rawForm === "handelsbolag" || rawForm === "ab" ? rawForm : "ab";

  const known = new Set(LINE_ITEMS.map((item) => item.id));
  const enabled = (params.get("extra") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => known.has(id));

  const amounts: Record<string, number> = {};
  for (const pair of (params.get("belopp") ?? "").split(",")) {
    const [id, raw] = pair.split(":");
    const amount = Number(raw);
    if (known.has(id) && Number.isFinite(amount) && amount >= 0) {
      amounts[id] = Math.round(amount);
    }
  }

  return { form, amounts, enabled };
}
