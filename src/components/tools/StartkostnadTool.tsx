"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  LINE_ITEMS,
  amountFor,
  fromQuery,
  itemsForForm,
  toQuery,
  totals,
  type LineItem,
  type Selection,
  type StartCostTotals,
} from "@/lib/tax/startkostnad";
import { FORM_NAMES, type CompanyForm } from "@/lib/tax/bolagsform";
import { PartnerCta } from "@/components/PartnerCta";
import { LeadForm } from "@/components/LeadForm";
import { EmailResult } from "./EmailResult";
import { ToolSources, formatSek } from "./ToolSources";

/**
 * Tool 2, Startkostnadskalkylatorn (plan §5.3): pick a bolagsform, then edit
 * every line. Totals split "att betala vid start" from "per månad första året",
 * and aktiekapital is shown apart from the money that is actually gone.
 */

const SOURCE_KEYS = [
  "bolagsverket-ab-nyregistrering",
  "bolagsverket-ab-nyregistrering-blankett",
  "bolagsverket-enskild-firma",
  "bolagsverket-handelsbolag",
  "aktiekapital-minimum",
  "fskatt",
];

const FORM_ORDER: CompanyForm[] = ["ab", "enskild", "handelsbolag"];

type State = {
  selection: Selection;
  result: StartCostTotals;
  setForm: (form: CompanyForm) => void;
  setAmount: (id: string, amount: string) => void;
  toggle: (id: string) => void;
  reset: () => void;
};

const Context = createContext<State | null>(null);

function useTool(): State {
  const state = useContext(Context);
  if (!state) throw new Error("Startkostnad components must be inside <StartkostnadProvider>");
  return state;
}

export function StartkostnadProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<Selection>({ form: "ab", amounts: {}, enabled: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSelection(fromQuery(new URLSearchParams(window.location.search)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const query = toQuery(selection);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [selection, ready]);

  const result = useMemo(() => totals(selection), [selection]);

  const setForm = useCallback((form: CompanyForm) => {
    setSelection((current) => ({ ...current, form }));
  }, []);

  const setAmount = useCallback((id: string, raw: string) => {
    setSelection((current) => {
      const amounts = { ...current.amounts };
      const parsed = Number(raw.replace(/\s/g, ""));
      if (raw.trim() === "" || !Number.isFinite(parsed) || parsed < 0) {
        delete amounts[id];
      } else {
        amounts[id] = Math.round(parsed);
      }
      return { ...current, amounts };
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelection((current) => ({
      ...current,
      enabled: current.enabled.includes(id)
        ? current.enabled.filter((entry) => entry !== id)
        : [...current.enabled, id],
    }));
  }, []);

  const reset = useCallback(() => {
    setSelection((current) => ({ form: current.form, amounts: {}, enabled: [] }));
  }, []);

  const value = useMemo(
    () => ({ selection, result, setForm, setAmount, toggle, reset }),
    [selection, result, setForm, setAmount, toggle, reset],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function LineRow({ item }: { item: LineItem }) {
  const { selection, setAmount, toggle } = useTool();
  const on = !item.optional || selection.enabled.includes(item.id);
  const amount = amountFor(item, selection);
  const inputId = `line-${item.id}`;

  return (
    <div className="line">
      <span className="line__label">
        {item.optional ? (
          <label className="line__toggle" htmlFor={`toggle-${item.id}`}>
            <input
              checked={on}
              id={`toggle-${item.id}`}
              onChange={() => toggle(item.id)}
              type="checkbox"
            />
            <span>{item.label}</span>
          </label>
        ) : (
          <label htmlFor={inputId}>{item.label}</label>
        )}
        <span className="line__kind">{item.kind === "once" ? "vid start" : "per månad"}</span>
      </span>

      <span className="line__input">
        <input
          aria-label={`${item.label}, kronor`}
          disabled={!on}
          id={inputId}
          inputMode="numeric"
          onChange={(event) => setAmount(item.id, event.target.value)}
          value={on ? String(amount) : ""}
        />
        <span className="line__unit">kr</span>
      </span>

      <p className="line__help">
        {item.help}
        {item.range ? (
          <>
            {" "}
            Vanligt spann: {formatSek(item.range.low)}–{formatSek(item.range.high)}.
          </>
        ) : null}
      </p>
    </div>
  );
}

export function StartkostnadSteps() {
  const { selection, setForm, reset } = useTool();

  return (
    <div className="q">
      <fieldset className="q__options">
        <legend className="q__title">Vilken bolagsform räknar du på?</legend>
        {FORM_ORDER.map((form) => (
          <button
            aria-pressed={selection.form === form}
            className="q__option"
            data-option={form}
            key={form}
            onClick={() => setForm(form)}
            type="button"
          >
            <span aria-hidden="true" className="q__option-mark">
              {selection.form === form ? "✓" : ""}
            </span>
            <span>{FORM_NAMES[form]}</span>
          </button>
        ))}
      </fieldset>

      <p className="q__help">
        Posterna nedan är förifyllda med myndighetsavgifter där det finns en, och med
        mitten av ett marknadsspann där priset sätts av leverantören. Ändra varje rad till
        det du faktiskt får betalt för.
      </p>

      <fieldset className="lines">
        <legend className="q__title">Dina poster</legend>
        {itemsForForm(selection.form).map((item) => (
          <LineRow item={item} key={item.id} />
        ))}
      </fieldset>

      <div className="tool__actions">
        <button className="btn btn--ghost btn--small" onClick={reset} type="button">
          Återställ beloppen
        </button>
      </div>

      <ToolSources keys={SOURCE_KEYS} />
    </div>
  );
}

export function StartkostnadResult() {
  const { result } = useTool();
  const once = result.lines.filter((line) => line.item.kind === "once" && line.amount !== 0);
  const monthly = result.lines.filter((line) => line.item.kind === "monthly" && line.amount !== 0);

  return (
    <>
      <div className="result__figures">
        <div className="result__verdict">
          <p className="result__label">Att betala vid start</p>
          <p className="result__figure" data-testid="total-once">
            {formatSek(result.once)}
          </p>
        </div>
        <div className="result__verdict">
          <p className="result__label">Per månad</p>
          <p className="result__figure" data-testid="total-monthly">
            {formatSek(result.monthly)}
          </p>
        </div>
      </div>

      {result.ofWhichAktiekapital > 0 ? (
        <p className="result__explain">
          Varav {formatSek(result.ofWhichAktiekapital)} är aktiekapital, som blir bolagets
          egna pengar och får användas i verksamheten. Rena utlägg:{" "}
          <strong>{formatSek(result.onceExcludingCapital)}</strong>.
        </p>
      ) : null}

      <span className="result__estimate">
        Uppskattning, inte rådgivning · Källa Skatteverket, Bolagsverket
      </span>

      <div className="result__box">
        <table className="ledger">
          <caption>Vid start</caption>
          <tbody>
            {once.map((line) => (
              <tr key={line.item.id}>
                <th scope="row">{line.item.label}</th>
                <td>{formatSek(line.amount)}</td>
              </tr>
            ))}
            <tr className="ledger__total">
              <th scope="row">Summa vid start</th>
              <td>{formatSek(result.once)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="result__box">
        <table className="ledger">
          <caption>Löpande, per månad</caption>
          <tbody>
            {monthly.length ? (
              monthly.map((line) => (
                <tr key={line.item.id}>
                  <th scope="row">{line.item.label}</th>
                  <td>{formatSek(line.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <th scope="row">Inga löpande kostnader ifyllda</th>
                <td>{formatSek(0)}</td>
              </tr>
            )}
            <tr className="ledger__total">
              <th scope="row">Per månad</th>
              <td>{formatSek(result.monthly)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="result__box">
        <table className="ledger">
          <caption>Första året</caption>
          <tbody>
            <tr className="ledger__total">
              <th scope="row">Vid start + tolv månader</th>
              <td data-testid="total-first-year">{formatSek(result.firstYear)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="tool__actions no-print">
        <button className="btn btn--ghost btn--small" onClick={() => window.print()} type="button">
          Skriv ut checklistan
        </button>
      </div>
    </>
  );
}

export function StartkostnadPartners() {
  const { selection, result } = useTool();
  const ids = result.lines
    .filter((line) => line.item.partners?.length)
    .flatMap((line) => line.item.partners ?? []);
  const unique = [...new Set(ids)].slice(0, 6);

  return (
    <>
      {unique.length ? (
        <PartnerCta heading="Passar ditt svar" partners={unique} />
      ) : null}
      <EmailResult
        payload={{ form: selection.form, once: result.once, monthly: result.monthly }}
        summary={`Startkostnad för ${FORM_NAMES[selection.form]}: ${formatSek(result.once)} vid start, ${formatSek(result.monthly)} per månad`}
        tool="startkostnad"
      />
      <LeadForm sourcePage="/verktyg/startkostnad/" />
      <p className="q__help no-print">
        Räknar du på {FORM_NAMES[selection.form].toLowerCase()}? Posterna med{" "}
        {LINE_ITEMS.filter((item) => item.range).length} marknadsspann är de som varierar
        mest mellan leverantörer — det är där du sparar mest på att jämföra.
      </p>
    </>
  );
}
