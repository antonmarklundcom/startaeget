import { describe, expect, it } from "vitest";
import {
  constant,
  constants,
  rate,
  value,
  type TaxConstant,
} from "../src/lib/tax/constants";
import {
  arbetsgivaravgifter,
  bolagsskatt,
  egenavgifter,
  grundavdrag,
  jobbskatteavdrag,
  taxOnEarnedIncome,
  utdelningsskatt,
} from "../src/lib/tax/income";
import * as bolagsform from "../src/lib/tax/bolagsform";
import * as startkostnad from "../src/lib/tax/startkostnad";
import * as vadblirkvar from "../src/lib/tax/vadblirkvar";

/**
 * The three tools are the product, so the maths is tested rather than eyeballed
 * (plan §5.3: at least five cases each). The assertions are mostly invariants —
 * monotonicity, conservation, bounds — because the constants behind them are
 * still unverified and golden numbers would break on the first correction. The
 * few exact figures that are pinned are the ones a reader would check by hand.
 */

describe("tax constants", () => {
  it("gives every constant a source, a validFrom and a unit", () => {
    for (const item of constants) {
      expect(item.source, item.key).toMatch(/^https:\/\//);
      expect(item.validFrom, item.key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.label.length, item.key).toBeGreaterThan(5);
    }
  });

  it("makes every unverified constant explain itself", () => {
    const unverified = constants.filter((item: TaxConstant) => !item.verified);
    expect(unverified.length).toBeGreaterThan(0);
    for (const item of unverified) {
      expect(item.note, item.key).toBeTruthy();
      expect(item.verifiedOn, item.key).toBeNull();
    }
  });

  it("throws on an unknown key instead of returning zero", () => {
    expect(() => constant("finns-inte")).toThrow(/Unknown tax constant/);
    expect(() => rate("aktiekapital-minimum")).toThrow(/not a percentage/);
  });

  it("converts percentages to multipliers", () => {
    expect(rate("bolagsskatt")).toBeCloseTo(0.206, 10);
    expect(value("aktiekapital-minimum")).toBe(25_000);
  });
});

describe("income tax", () => {
  it("never taxes more than the income", () => {
    for (const income of [0, 1_000, 50_000, 200_000, 600_000, 1_500_000]) {
      const tax = taxOnEarnedIncome(income);
      expect(tax.total).toBeGreaterThanOrEqual(0);
      expect(tax.total).toBeLessThanOrEqual(income);
      expect(tax.net).toBeGreaterThanOrEqual(0);
    }
  });

  it("is monotonic: more income always leaves more in hand", () => {
    let previous = -1;
    for (let income = 0; income <= 2_000_000; income += 25_000) {
      const { net } = taxOnEarnedIncome(income);
      expect(net).toBeGreaterThanOrEqual(previous);
      previous = net;
    }
  });

  it("charges statlig skatt only above the skiktgräns", () => {
    const below = taxOnEarnedIncome(400_000);
    const above = taxOnEarnedIncome(900_000);
    expect(below.statlig).toBe(0);
    expect(above.statlig).toBeGreaterThan(0);
    expect(above.effectiveRate).toBeGreaterThan(below.effectiveRate);
  });

  it("keeps grundavdrag and jobbskatteavdrag inside sane bounds", () => {
    for (const income of [0, 25_000, 100_000, 350_000, 700_000, 2_000_000]) {
      expect(grundavdrag(income)).toBeLessThanOrEqual(Math.max(income, 0.8 * value("prisbasbelopp")));
      expect(grundavdrag(income)).toBeGreaterThanOrEqual(0);
      expect(jobbskatteavdrag(income)).toBeGreaterThanOrEqual(0);
      expect(jobbskatteavdrag(income)).toBeLessThanOrEqual(0.7 * value("prisbasbelopp"));
    }
    expect(grundavdrag(0)).toBe(0);
  });

  it("takes egenavgifter on the base after the schablonavdrag, not on the surplus", () => {
    const result = egenavgifter(400_000);
    expect(result.schablonavdrag).toBe(100_000);
    expect(result.base).toBe(300_000);
    expect(result.avgifter).toBe(Math.round(300_000 * 0.2897));
    expect(result.taxableSurplus).toBe(400_000 - result.avgifter);
  });

  it("computes the flat company charges exactly", () => {
    expect(arbetsgivaravgifter(100_000)).toBe(31_420);
    expect(bolagsskatt(100_000)).toBe(20_600);
    expect(arbetsgivaravgifter(-5)).toBe(0);
    expect(bolagsskatt(0)).toBe(0);
  });

  it("splits a dividend at the grundbelopp", () => {
    const allowance = value("utdelning-grundbelopp");
    const within = utdelningsskatt(allowance, allowance, 0.3238);
    expect(within.high).toBe(0);
    expect(within.low).toBe(Math.round(allowance * 0.2));

    const over = utdelningsskatt(allowance + 100_000, allowance, 0.3238);
    expect(over.high).toBe(Math.round(100_000 * 0.3238));
    expect(over.total).toBeGreaterThan(within.total);
  });
});

describe("tool 1 — Bolagsformsväljaren", () => {
  const answerAll = (overrides: bolagsform.Answers = {}): bolagsform.Answers => {
    const answers: bolagsform.Answers = {};
    for (const question of bolagsform.QUESTIONS) {
      answers[question.id] = overrides[question.id] ?? question.options[0].id;
    }
    return answers;
  };

  it("asks between six and eight questions, each with at least two options", () => {
    expect(bolagsform.QUESTIONS.length).toBeGreaterThanOrEqual(6);
    expect(bolagsform.QUESTIONS.length).toBeLessThanOrEqual(8);
    for (const question of bolagsform.QUESTIONS) {
      expect(question.options.length, question.id).toBeGreaterThanOrEqual(2);
      expect(new Set(question.options.map((o) => o.id)).size).toBe(question.options.length);
    }
  });

  it("recommends nothing until every question is answered", () => {
    const partial = { vinst: "over-500", risk: "hog" };
    const result = bolagsform.recommend(partial);
    expect(result.form).toBeNull();
    expect(result.answered).toBe(2);
    expect(result.total).toBe(bolagsform.QUESTIONS.length);
  });

  it("picks aktiebolag for the high-profit, high-risk, sell-later founder", () => {
    const result = bolagsform.recommend(
      answerAll({
        vinst: "over-500",
        risk: "hog",
        kapital: "ja",
        anstalla: "ja",
        salja: "ja",
        uttag: "lon-utdelning",
        omfattning: "huvudinkomst",
      }),
    );
    expect(result.form).toBe("ab");
    expect(result.reasons.length).toBe(bolagsform.QUESTIONS.length);
  });

  it("picks enskild firma for the low-profit solo side hustle", () => {
    const result = bolagsform.recommend(
      answerAll({
        vinst: "under-200",
        delagare: "sjalv",
        risk: "lag",
        kapital: "nej",
        anstalla: "nej",
        salja: "nej",
        uttag: "enkelt",
        omfattning: "bisyssla",
      }),
    );
    expect(result.form).toBe("enskild");
  });

  it("rules enskild firma out entirely as soon as there are partners", () => {
    const result = bolagsform.recommend(
      answerAll({ delagare: "med-andra", vinst: "under-200", uttag: "enkelt", omfattning: "bisyssla" }),
    );
    expect(result.excluded).toContain("enskild");
    expect(result.form).not.toBe("enskild");
  });

  it("flags a near-tie instead of pretending to be sure", () => {
    const result = bolagsform.recommend(
      answerAll({
        vinst: "200-500",
        delagare: "sjalv",
        risk: "medel",
        kapital: "ja",
        anstalla: "nej",
        salja: "nej",
        uttag: "enkelt",
        omfattning: "huvudinkomst",
      }),
    );
    expect(result.form).not.toBeNull();
    expect(typeof result.close).toBe("boolean");
    expect(result.scores.ab).toBeGreaterThan(0);
  });

  it("round-trips answers through the shareable URL and drops junk", () => {
    const answers = answerAll({ vinst: "over-500", risk: "hog" });
    const query = bolagsform.toQuery(answers);
    expect(bolagsform.fromQuery(new URLSearchParams(query))).toEqual(answers);

    const dirty = new URLSearchParams("vinst=hittepa&risk=hog&okand=1");
    expect(bolagsform.fromQuery(dirty)).toEqual({ risk: "hog" });
  });

  it("gives every form next steps and partner slots", () => {
    for (const form of ["ab", "enskild", "handelsbolag"] as const) {
      expect(bolagsform.nextSteps(form).length).toBeGreaterThanOrEqual(5);
      expect(bolagsform.partnersFor(form).length).toBeGreaterThan(0);
    }
  });
});

describe("tool 2 — Startkostnadskalkylatorn", () => {
  it("shows aktiekapital only for aktiebolag", () => {
    const abIds = startkostnad.itemsForForm("ab").map((item) => item.id);
    const enskildIds = startkostnad.itemsForForm("enskild").map((item) => item.id);
    expect(abIds).toContain("aktiekapital");
    expect(abIds).toContain("registrering-ab");
    expect(enskildIds).not.toContain("aktiekapital");
    expect(enskildIds).not.toContain("registrering-ab");
  });

  it("counts optional lines only once they are switched on", () => {
    const base = startkostnad.totals({ form: "ab", amounts: {}, enabled: [] });
    const withByra = startkostnad.totals({ form: "ab", amounts: {}, enabled: ["byra"] });
    expect(withByra.monthly).toBe(base.monthly + 1_500);
    expect(withByra.once).toBe(base.once);
  });

  it("separates aktiekapital from money that is actually spent", () => {
    const result = startkostnad.totals({ form: "ab", amounts: {}, enabled: [] });
    expect(result.ofWhichAktiekapital).toBe(25_000);
    expect(result.onceExcludingCapital).toBe(result.once - 25_000);
    expect(result.once).toBeGreaterThan(25_000);
  });

  it("adds the first year as once + twelve months", () => {
    const result = startkostnad.totals({ form: "enskild", amounts: {}, enabled: ["forsakring"] });
    expect(result.firstYear).toBe(result.once + result.monthly * 12);
  });

  it("lets every default be overridden, and ignores nonsense", () => {
    const selection: startkostnad.Selection = {
      form: "ab",
      amounts: { bokforingsprogram: 0, aktiekapital: 50_000, forsakring: -100 },
      enabled: [],
    };
    const byId = new Map(
      startkostnad.totals(selection).lines.map((line) => [line.item.id, line.amount]),
    );
    expect(byId.get("bokforingsprogram")).toBe(0);
    expect(byId.get("aktiekapital")).toBe(50_000);
    // Negative override falls back to the default rather than crediting the user.
    const forsakring = startkostnad.LINE_ITEMS.find((item) => item.id === "forsakring");
    expect(startkostnad.amountFor(forsakring!, selection)).toBe(forsakring!.default);
  });

  it("round-trips the selection through the URL, keeping only real edits", () => {
    const selection: startkostnad.Selection = {
      form: "enskild",
      amounts: { bokforingsprogram: 99 },
      enabled: ["byra"],
    };
    const parsed = startkostnad.fromQuery(new URLSearchParams(startkostnad.toQuery(selection)));
    expect(parsed).toEqual(selection);

    const untouched = startkostnad.toQuery({ form: "ab", amounts: { forsakring: 250 }, enabled: [] });
    expect(untouched).not.toContain("belopp");
  });

  it("defaults to aktiebolag and tolerates a broken query string", () => {
    const parsed = startkostnad.fromQuery(new URLSearchParams("form=hittepa&extra=nix&belopp=x:y"));
    expect(parsed).toEqual({ form: "ab", amounts: {}, enabled: [] });
  });

  it("gives every market-priced line a range and a partner or an explanation", () => {
    for (const item of startkostnad.LINE_ITEMS) {
      expect(item.help.length, item.id).toBeGreaterThan(20);
      if (item.range) expect(item.range.high).toBeGreaterThanOrEqual(item.range.low);
      if (!item.constantKey && item.default > 0) expect(item.range, item.id).toBeTruthy();
    }
  });
});

describe("tool 3 — Vad blir kvar", () => {
  it("leaves nothing to anyone when there is no surplus", () => {
    const result = vadblirkvar.compare({ revenue: 100_000, costs: 150_000 });
    expect(result.surplus).toBe(0);
    expect(result.enskild.net).toBe(0);
    expect(result.ab.net).toBe(0);
    expect(result.better).toBe("lika");
  });

  it("never hands out more than the surplus, in either form", () => {
    for (const revenue of [100_000, 400_000, 900_000, 2_500_000]) {
      const result = vadblirkvar.compare({ revenue, costs: 50_000 });
      for (const form of [result.enskild, result.ab]) {
        expect(form.net, `${form.form} @ ${revenue}`).toBeGreaterThan(0);
        expect(form.net).toBeLessThan(result.surplus);
        expect(form.keepRate).toBeGreaterThan(0);
        expect(form.keepRate).toBeLessThan(1);
      }
    }
  });

  it("conserves money: net plus tax equals the surplus", () => {
    for (const revenue of [300_000, 700_000, 1_800_000]) {
      const result = vadblirkvar.compare({ revenue, costs: 0 });
      expect(result.enskild.net + result.enskild.totalTax).toBeCloseTo(result.surplus, -2);
      expect(result.ab.net + result.ab.totalTax).toBeCloseTo(result.surplus, -2);
    }
  });

  it("favours the aktiebolag once the surplus is large", () => {
    const small = vadblirkvar.compare({ revenue: 250_000, costs: 0 });
    const large = vadblirkvar.compare({ revenue: 2_000_000, costs: 0 });
    expect(large.difference).toBeGreaterThan(small.difference);
    expect(large.better).toBe("ab");
  });

  it("uses the visitor's own kommunalskatt when they give one", () => {
    const average = vadblirkvar.compare({ revenue: 600_000, costs: 0 });
    const cheap = vadblirkvar.compare({ revenue: 600_000, costs: 0, kommunalskatt: 28.93 });
    const dear = vadblirkvar.compare({ revenue: 600_000, costs: 0, kommunalskatt: 35.65 });
    expect(cheap.enskild.net).toBeGreaterThan(average.enskild.net);
    expect(dear.enskild.net).toBeLessThan(average.enskild.net);
    expect(cheap.assumptions.some((line) => line.includes("din egen"))).toBe(true);
  });

  it("caps the aktiebolag salary at the brytpunkt and pays the rest as utdelning", () => {
    const result = vadblirkvar.compare({ revenue: 2_000_000, costs: 0 });
    const salary = result.ab.lines.find((line) => line.label === "Lön till dig");
    const dividend = result.ab.lines.find((line) => line.label === "Utdelning till dig");
    expect(salary?.amount).toBe(value("brytpunkt-statlig-skatt"));
    expect(dividend?.amount).toBeGreaterThan(0);
  });

  it("shows a per-hour figure only when hours are given", () => {
    expect(vadblirkvar.compare({ revenue: 600_000, costs: 0 }).netPerHour).toBeNull();
    const withHours = vadblirkvar.compare({ revenue: 600_000, costs: 0, hoursPerWeek: 40 });
    expect(withHours.netPerHour?.enskild).toBeGreaterThan(0);
    expect(withHours.netPerHour?.ab).toBeGreaterThan(0);
  });

  it("lists its assumptions and round-trips through the URL", () => {
    const result = vadblirkvar.compare({ revenue: 600_000, costs: 60_000 });
    expect(result.assumptions.length).toBeGreaterThanOrEqual(5);

    const input = { revenue: 750_000, costs: 120_000, kommunalskatt: 31.5, hoursPerWeek: 30 };
    expect(vadblirkvar.fromQuery(new URLSearchParams(vadblirkvar.toQuery(input)))).toEqual(input);
    expect(vadblirkvar.fromQuery(new URLSearchParams("omsattning=-5"))).toEqual(
      vadblirkvar.DEFAULT_INPUT,
    );
  });
});
