import { rate, value } from "./constants";
import {
  arbetsgivaravgifter,
  bolagsskatt,
  clampPositive,
  egenavgifter,
  taxOnEarnedIncome,
  utdelningsskatt,
} from "./income";

/**
 * Tool 3, Vad blir kvar (plan §5.3): from revenue and costs to money in your
 * pocket, enskild firma beside aktiebolag on the same numbers.
 *
 * Simplifications, all of them listed in the UI next to the result:
 *  - revenue and costs are excluding moms, so moms never enters the maths;
 *  - the national average kommunalskatt unless the visitor types their own;
 *  - grundavdrag and jobbskatteavdrag are the approximations in income.ts;
 *  - the AB case takes salary up to the state-tax threshold (or the whole
 *    surplus if it is smaller) and the rest as a dividend, which is the usual
 *    advice but not always the optimum;
 *  - no pension saving, no sick pay, no previous employment income.
 */

export type Input = {
  /** Revenue excluding VAT, per year. */
  revenue: number;
  /** Business costs excluding VAT, per year (not your own salary). */
  costs: number;
  /** Municipal tax rate as a percentage, e.g. 32.38. */
  kommunalskatt?: number;
  /** Hours per week, for the "per timme" line. 0 hides it. */
  hoursPerWeek?: number;
};

export type Breakdown = {
  label: string;
  amount: number;
  /** Negative lines are deductions, shown as such. */
  kind: "in" | "out" | "total";
  help?: string;
};

export type FormResult = {
  form: "enskild" | "ab";
  /** Profit before any tax or own salary. */
  surplus: number;
  /** What reaches the owner's own account after everything. */
  net: number;
  /** net / surplus, 0–1. Zero surplus → 0. */
  keepRate: number;
  /** Total tax and contributions. */
  totalTax: number;
  lines: Breakdown[];
  /** Aktiebolag only: the dividend paid, and how much of it fell outside the
   *  lågbeskattad grundbelopp and was therefore taxed as tjänsteinkomst. */
  dividend?: number;
  dividendAboveAllowance?: number;
};

export type Comparison = {
  surplus: number;
  enskild: FormResult;
  ab: FormResult;
  /** Positive when the aktiebolag leaves more. */
  difference: number;
  better: "enskild" | "ab" | "lika";
  netPerHour: { enskild: number; ab: number } | null;
  assumptions: string[];
};

function round(amount: number): number {
  return Math.round(amount);
}

/** Enskild firma: överskott → egenavgifter → inkomstskatt → kvar. */
export function enskildFirma(surplus: number, kommunalRate: number): FormResult {
  const overskott = clampPositive(surplus);
  const avgifter = egenavgifter(overskott);
  const tax = taxOnEarnedIncome(avgifter.taxableSurplus, kommunalRate);
  const net = Math.max(0, avgifter.taxableSurplus - tax.total);

  return {
    form: "enskild",
    surplus: overskott,
    net,
    keepRate: overskott > 0 ? net / overskott : 0,
    totalTax: avgifter.avgifter + tax.total,
    lines: [
      { label: "Överskott i firman", amount: overskott, kind: "in" },
      {
        label: "Egenavgifter",
        amount: -avgifter.avgifter,
        kind: "out",
        help: `28,97 % på överskottet efter schablonavdraget på 25 % (${round(avgifter.base).toLocaleString("sv-SE")} kr).`,
      },
      {
        label: "Kommunal inkomstskatt",
        amount: -tax.kommunal,
        kind: "out",
        help: `${(kommunalRate * 100).toLocaleString("sv-SE", { maximumFractionDigits: 2 })} % på ${tax.taxableIncome.toLocaleString("sv-SE")} kr efter grundavdrag.`,
      },
      ...(tax.statlig > 0
        ? [
            {
              label: "Statlig inkomstskatt",
              amount: -tax.statlig,
              kind: "out" as const,
              help: "20 % på den del av inkomsten som ligger över skiktgränsen.",
            },
          ]
        : []),
      {
        label: "Jobbskatteavdrag",
        amount: tax.jobbskatteavdrag,
        kind: "in",
        help: "Uppskattat — den exakta summan beror på en tabell som ändras varje år.",
      },
      { label: "Kvar till dig", amount: net, kind: "total" },
    ],
  };
}

/**
 * Aktiebolag: salary up to the state-tax threshold, the remaining profit taxed
 * as company profit and paid out as a dividend.
 */
export function aktiebolag(surplus: number, kommunalRate: number): FormResult {
  const overskott = clampPositive(surplus);
  const threshold = value("brytpunkt-statlig-skatt");

  // Salary costs the company salary + arbetsgivaravgifter, so the most it can
  // pay at the threshold is threshold × (1 + avgift).
  const salaryCeilingCost = threshold * (1 + rate("arbetsgivaravgifter"));
  const salary =
    overskott >= salaryCeilingCost
      ? threshold
      : round(overskott / (1 + rate("arbetsgivaravgifter")));

  const avgifter = arbetsgivaravgifter(salary);
  const salaryTax = taxOnEarnedIncome(salary, kommunalRate);
  const netSalary = Math.max(0, salary - salaryTax.total);

  const profitBeforeTax = Math.max(0, overskott - salary - avgifter);
  const companyTax = bolagsskatt(profitBeforeTax);
  const dividend = Math.max(0, profitBeforeTax - companyTax);
  const dividendTax = utdelningsskatt(dividend, value("utdelning-grundbelopp"), kommunalRate);

  const net = netSalary + dividendTax.net;

  const allowance = value("utdelning-grundbelopp");

  return {
    form: "ab",
    surplus: overskott,
    dividend,
    dividendAboveAllowance: Math.max(0, dividend - allowance),
    net,
    keepRate: overskott > 0 ? net / overskott : 0,
    totalTax: avgifter + salaryTax.total + companyTax + dividendTax.total,
    lines: [
      { label: "Vinst i bolaget före lön", amount: overskott, kind: "in" },
      {
        label: "Lön till dig",
        amount: salary,
        kind: "in",
        help:
          salary >= threshold
            ? "Lön upp till brytpunkten, så att du slipper statlig inkomstskatt på lönen."
            : "Hela överskottet tas som lön — det räcker inte upp till brytpunkten.",
      },
      {
        label: "Arbetsgivaravgifter på lönen",
        amount: -avgifter,
        kind: "out",
        help: "31,42 % som bolaget betalar utöver din lön.",
      },
      {
        label: "Skatt på lönen",
        amount: -salaryTax.total,
        kind: "out",
        help: "Kommunalskatt och eventuell statlig skatt, efter grundavdrag och jobbskatteavdrag.",
      },
      {
        label: "Bolagsskatt på kvarvarande vinst",
        amount: -companyTax,
        kind: "out",
        help: `20,6 % på ${profitBeforeTax.toLocaleString("sv-SE")} kr.`,
      },
      {
        label: "Utdelning till dig",
        amount: dividend,
        kind: "in",
        help: "Vinsten efter bolagsskatt, utbetald som utdelning.",
      },
      {
        label: "Skatt på utdelningen",
        amount: -dividendTax.total,
        kind: "out",
        help:
          dividend > allowance
            ? `20 % på de första ${allowance.toLocaleString("sv-SE")} kr. Resten, ${Math.round(dividend - allowance).toLocaleString("sv-SE")} kr, ligger utanför grundbeloppet och beskattas som tjänsteinkomst.`
            : `20 % upp till grundbeloppet på ${allowance.toLocaleString("sv-SE")} kr.`,
      },
      { label: "Kvar till dig", amount: net, kind: "total" },
    ],
  };
}

export function compare(input: Input): Comparison {
  const revenue = clampPositive(input.revenue);
  const costs = clampPositive(input.costs);
  const surplus = Math.max(0, revenue - costs);
  const kommunalRate =
    typeof input.kommunalskatt === "number" &&
    Number.isFinite(input.kommunalskatt) &&
    input.kommunalskatt > 0 &&
    input.kommunalskatt < 100
      ? input.kommunalskatt / 100
      : rate("kommunalskatt-genomsnitt");

  const enskild = enskildFirma(surplus, kommunalRate);
  const ab = aktiebolag(surplus, kommunalRate);
  const difference = ab.net - enskild.net;

  const hours = clampPositive(input.hoursPerWeek ?? 0);
  const yearlyHours = hours * 46;

  return {
    surplus,
    enskild,
    ab,
    difference,
    better: Math.abs(difference) < 1_000 ? "lika" : difference > 0 ? "ab" : "enskild",
    netPerHour:
      yearlyHours > 0
        ? {
            enskild: round(enskild.net / yearlyHours),
            ab: round(ab.net / yearlyHours),
          }
        : null,
    assumptions: [
      "Omsättning och kostnader är angivna exklusive moms, så momsen påverkar inte uträkningen.",
      `Kommunalskatt ${(kommunalRate * 100).toLocaleString("sv-SE", { maximumFractionDigits: 2 })} %${
        input.kommunalskatt ? " (din egen)" : " (riksgenomsnitt — byt till din kommuns)"
      }.`,
      "Grundavdrag och jobbskatteavdrag är uppskattade med förenklade formler, inte Skatteverkets exakta tabeller.",
      "I aktiebolaget tas lön upp till brytpunkten för statlig skatt och resten som utdelning. Det är vanligt, men inte alltid det bästa för just dig.",
      ab.dividendAboveAllowance && ab.dividendAboveAllowance > 0
        ? `Utdelningen är större än grundbeloppet för lågbeskattad utdelning. De första ${value("utdelning-grundbelopp").toLocaleString("sv-SE")} kr beskattas med 20 %; de ${Math.round(ab.dividendAboveAllowance).toLocaleString("sv-SE")} kr som ligger över beskattas som tjänsteinkomst, här grovt uppskattat med kommunalskattesatsen. Med en högre lön i stället för utdelning kan utfallet bli ett annat — det är ett fall att räkna på med en byrå.`
        : "Utdelningen ligger inom grundbeloppet för lågbeskattad utdelning, som du delar med eventuella andra delägare.",
      "Ingen hänsyn är tagen till pensionssparande, sjukpenning, tjänstepension eller annan inkomst du har under året.",
      "Du antas vara under 66 år och ha full egenavgift respektive full arbetsgivaravgift.",
    ],
  };
}

/** URL state. */
export function toQuery(input: Input): string {
  const params = new URLSearchParams();
  params.set("omsattning", String(Math.round(clampPositive(input.revenue))));
  params.set("kostnader", String(Math.round(clampPositive(input.costs))));
  if (input.kommunalskatt) params.set("kommunalskatt", String(input.kommunalskatt));
  if (input.hoursPerWeek) params.set("timmar", String(Math.round(input.hoursPerWeek)));
  return params.toString();
}

export function fromQuery(params: URLSearchParams): Input {
  const num = (key: string): number | undefined => {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };
  return {
    revenue: num("omsattning") ?? 600_000,
    costs: num("kostnader") ?? 60_000,
    kommunalskatt: num("kommunalskatt"),
    hoursPerWeek: num("timmar"),
  };
}

export const DEFAULT_INPUT: Input = { revenue: 600_000, costs: 60_000 };
