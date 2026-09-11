import { rate, value } from "./constants";

/**
 * Personal income tax, as much of it as an estimate needs (plan §5.3).
 *
 * Grundavdrag and jobbskatteavdrag are both piecewise functions of income that
 * Skatteverket republishes every year. The plan asks for an *approximation* of
 * each, and that is what this is: the shape is right, the rounding is not, and
 * every result panel that uses it says so. Anyone wanting the exact krona uses
 * Skatteverket's own räknesnurra — which the tool links to.
 */

/** Rounded to whole kronor the way a tax table is. */
function round(amount: number): number {
  return Math.round(amount);
}

export function clampPositive(amount: number): number {
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/**
 * Grundavdrag, approximated. The real table rises from a floor, plateaus, then
 * phases back down to a floor as income grows; these breakpoints follow the
 * 2026 shape in prisbasbelopp terms.
 */
export function grundavdrag(earnedIncome: number): number {
  const income = clampPositive(earnedIncome);
  const pbb = value("prisbasbelopp");
  const floor = round(0.293 * pbb);
  const ceiling = round(0.77 * pbb);

  if (income <= floor) return income;
  if (income <= 1.11 * pbb) return floor + round(0.2 * (income - floor));
  if (income <= 2.72 * pbb) return ceiling;
  if (income <= 7.88 * pbb) return Math.max(floor, ceiling - round(0.1 * (income - 2.72 * pbb)));
  return floor;
}

/**
 * Jobbskatteavdrag, approximated: a credit that climbs with earned income,
 * plateaus, then phases out above the state-tax threshold.
 */
export function jobbskatteavdrag(earnedIncome: number): number {
  const income = clampPositive(earnedIncome);
  const pbb = value("prisbasbelopp");
  const maxCredit = round(0.62 * pbb);
  const phaseOutStart = value("brytpunkt-statlig-skatt");

  if (income <= 0.91 * pbb) return round(0.15 * income);
  const ramp = Math.min(maxCredit, round(0.15 * 0.91 * pbb + 0.26 * (income - 0.91 * pbb)));
  if (income <= phaseOutStart) return ramp;
  return Math.max(0, ramp - round(0.03 * (income - phaseOutStart)));
}

export type IncomeTax = {
  /** Income the tax is calculated on, after grundavdrag. */
  taxableIncome: number;
  kommunal: number;
  statlig: number;
  jobbskatteavdrag: number;
  /** What actually leaves the payslip, never below zero. */
  total: number;
  net: number;
  /** Effective rate on gross earned income, 0–1. */
  effectiveRate: number;
};

/**
 * Tax on earned income (lön, or the överskott of an enskild firma after
 * egenavgifter). Uses the national average kommunalskatt — the caller may pass
 * its own rate once the visitor has typed theirs.
 */
export function taxOnEarnedIncome(
  earnedIncome: number,
  kommunalRate: number = rate("kommunalskatt-genomsnitt"),
): IncomeTax {
  const income = clampPositive(earnedIncome);
  const taxableIncome = Math.max(0, income - grundavdrag(income));

  const kommunal = round(taxableIncome * kommunalRate);
  const overSkiktgrans = Math.max(0, taxableIncome - value("skiktgrans"));
  const statlig = round(overSkiktgrans * rate("statlig-skatt"));
  const credit = Math.min(jobbskatteavdrag(income), kommunal + statlig);

  const total = Math.max(0, kommunal + statlig - credit);

  return {
    taxableIncome,
    kommunal,
    statlig,
    jobbskatteavdrag: credit,
    total,
    net: income - total,
    effectiveRate: income > 0 ? total / income : 0,
  };
}

/**
 * Egenavgifter in an enskild firma. The base is the överskott *after* the
 * schablonavdrag, and the avdrag is itself a share of the överskott — so the
 * effective load is lower than the headline 28,97 %.
 */
export function egenavgifter(surplus: number): {
  schablonavdrag: number;
  base: number;
  avgifter: number;
  /** Överskott after both the avdrag and the avgifter — what you are taxed on. */
  taxableSurplus: number;
} {
  const overskott = clampPositive(surplus);
  const schablonavdrag = round(overskott * rate("egenavgifter-schablonavdrag"));
  const base = Math.max(0, overskott - schablonavdrag);
  const avgifter = round(base * rate("egenavgifter"));
  return {
    schablonavdrag,
    base,
    avgifter,
    taxableSurplus: Math.max(0, overskott - avgifter),
  };
}

/** Arbetsgivaravgifter on a gross salary. */
export function arbetsgivaravgifter(grossSalary: number): number {
  return round(clampPositive(grossSalary) * rate("arbetsgivaravgifter"));
}

/** Bolagsskatt on a company's profit. */
export function bolagsskatt(profit: number): number {
  return round(clampPositive(profit) * rate("bolagsskatt"));
}

/**
 * Tax on a dividend. Everything inside the grundbelopp is taxed at 20 %;
 * anything above it is taxed as salary, which for this estimate means the
 * owner's marginal rate on earned income.
 */
export function utdelningsskatt(
  dividend: number,
  allowance: number = value("utdelning-grundbelopp"),
  marginalRate: number = rate("kommunalskatt-genomsnitt"),
): { low: number; high: number; total: number; net: number } {
  const amount = clampPositive(dividend);
  const within = Math.min(amount, clampPositive(allowance));
  const above = Math.max(0, amount - within);
  const low = round(within * rate("utdelningsskatt"));
  const high = round(above * marginalRate);
  return { low, high, total: low + high, net: amount - low - high };
}
