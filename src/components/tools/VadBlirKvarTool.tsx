"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_INPUT,
  compare,
  fromQuery,
  toQuery,
  type Comparison,
  type FormResult,
  type Input,
} from "@/lib/tax/vadblirkvar";
import { value } from "@/lib/tax/constants";
import { PartnerCta } from "@/components/PartnerCta";
import { LeadForm } from "@/components/LeadForm";
import { EmailResult } from "./EmailResult";
import { ToolSources, formatSek } from "./ToolSources";

/**
 * Tool 3, Vad blir kvar (plan §5.3): revenue and costs in, enskild firma beside
 * aktiebolag out. The assumptions are listed under the result because the
 * difference between the two columns is mostly a product of those assumptions.
 */

const SOURCE_KEYS = [
  "egenavgifter",
  "egenavgifter-schablonavdrag",
  "arbetsgivaravgifter",
  "bolagsskatt",
  "kommunalskatt-genomsnitt",
  "brytpunkt-statlig-skatt",
  "statlig-skatt",
  "utdelning-grundbelopp",
  "utdelningsskatt",
];

type State = {
  input: Input;
  result: Comparison;
  set: (field: keyof Input, raw: string) => void;
  reset: () => void;
};

const Context = createContext<State | null>(null);

function useTool(): State {
  const state = useContext(Context);
  if (!state) throw new Error("Vad blir kvar components must be inside <VadBlirKvarProvider>");
  return state;
}

export function VadBlirKvarProvider({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState<Input>(DEFAULT_INPUT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInput(fromQuery(new URLSearchParams(window.location.search)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", `?${toQuery(input)}`);
  }, [input, ready]);

  const result = useMemo(() => compare(input), [input]);

  const set = useCallback((field: keyof Input, raw: string) => {
    setInput((current) => {
      const cleaned = raw.replace(/\s/g, "").replace(",", ".");
      if (cleaned === "") {
        const next = { ...current };
        if (field === "revenue" || field === "costs") next[field] = 0;
        else delete next[field];
        return next;
      }
      const parsed = Number(cleaned);
      if (!Number.isFinite(parsed) || parsed < 0) return current;
      return { ...current, [field]: parsed };
    });
  }, []);

  const reset = useCallback(() => setInput(DEFAULT_INPUT), []);

  const state = useMemo(() => ({ input, result, set, reset }), [input, result, set, reset]);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function VadBlirKvarSteps() {
  const { input, result, set, reset } = useTool();

  return (
    <div className="q">
      <fieldset className="inputs">
        <legend className="q__title">Dina siffror för ett år</legend>

        <div className="inputs__field">
          <label htmlFor="omsattning">Omsättning exklusive moms</label>
          <input
            id="omsattning"
            inputMode="numeric"
            onChange={(event) => set("revenue", event.target.value)}
            value={String(input.revenue)}
          />
          <span className="inputs__hint">
            Det du fakturerar under ett år, utan moms. Momsen är inte din, så den räknas
            aldrig med.
          </span>
        </div>

        <div className="inputs__field">
          <label htmlFor="kostnader">Kostnader exklusive moms</label>
          <input
            id="kostnader"
            inputMode="numeric"
            onChange={(event) => set("costs", event.target.value)}
            value={String(input.costs)}
          />
          <span className="inputs__hint">
            Material, programvara, försäkring, lokal — allt utom din egen lön eller ditt
            eget uttag.
          </span>
        </div>

        <div className="inputs__field">
          <label htmlFor="kommunalskatt">Din kommunalskatt i procent</label>
          <input
            id="kommunalskatt"
            inputMode="decimal"
            onChange={(event) => set("kommunalskatt", event.target.value)}
            placeholder={String(value("kommunalskatt-genomsnitt"))}
            value={input.kommunalskatt === undefined ? "" : String(input.kommunalskatt)}
          />
          <span className="inputs__hint">
            Lämna tom för riksgenomsnittet {value("kommunalskatt-genomsnitt")} %. Din egen
            sats står på ditt skattebesked.
          </span>
        </div>

        <div className="inputs__field">
          <label htmlFor="timmar">Timmar per vecka (frivilligt)</label>
          <input
            id="timmar"
            inputMode="numeric"
            onChange={(event) => set("hoursPerWeek", event.target.value)}
            value={input.hoursPerWeek === undefined ? "" : String(input.hoursPerWeek)}
          />
          <span className="inputs__hint">
            Fyll i om du vill se vad du får kvar per arbetad timme, räknat på 46 veckor.
          </span>
        </div>
      </fieldset>

      <p className="q__help">
        Överskott att fördela: <strong>{formatSek(result.surplus)}</strong>. Det är den
        summan som ska bli lön, uttag, avgifter och skatt.
      </p>

      <div className="tool__actions">
        <button className="btn btn--ghost btn--small" onClick={reset} type="button">
          Återställ
        </button>
      </div>

      <ToolSources keys={SOURCE_KEYS} />
    </div>
  );
}

function Column({ result, winner }: { result: FormResult; winner: boolean }) {
  const name = result.form === "ab" ? "Aktiebolag" : "Enskild firma";
  return (
    <div className={winner ? "versus__col versus__col--winner" : "versus__col"}>
      <h3 className="versus__name">{name}</h3>
      <p className="versus__net" data-testid={`net-${result.form}`}>
        {formatSek(result.net)}
      </p>
      <p className="versus__rate">
        {Math.round(result.keepRate * 100)} % av överskottet kvar
      </p>
      {winner ? <span className="versus__badge">Mer kvar</span> : null}
    </div>
  );
}

function Ledger({ result }: { result: FormResult }) {
  return (
    <table className="ledger">
      <caption>{result.form === "ab" ? "Aktiebolag, rad för rad" : "Enskild firma, rad för rad"}</caption>
      <tbody>
        {result.lines.map((line) => (
          <tr
            className={
              line.kind === "total" ? "ledger__total" : line.kind === "out" ? "ledger__out" : undefined
            }
            key={line.label}
          >
            <th scope="row">
              {line.label}
              {line.help ? <span className="ledger__help">{line.help}</span> : null}
            </th>
            <td>
              {line.amount < 0 ? "−" : ""}
              {formatSek(Math.abs(line.amount))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function VadBlirKvarResult() {
  const { result } = useTool();

  return (
    <>
      <div className="result__verdict">
        <p className="result__label">Kvar till dig, per år</p>
        <div className="versus">
          <Column result={result.enskild} winner={result.better === "enskild"} />
          <Column result={result.ab} winner={result.better === "ab"} />
        </div>
        <span className="result__estimate">
          Uppskattning, inte rådgivning · Källa Skatteverket, Bolagsverket
        </span>
      </div>

      <p className="result__explain" data-testid="difference">
        {result.surplus === 0
          ? "Med de siffrorna finns inget överskott att fördela — kostnaderna är lika stora som omsättningen eller större."
          : result.better === "lika"
            ? "Skillnaden är mindre än tusen kronor om året. På den här nivån avgör risk, administration och hur du vill ta ut pengarna — inte skatten."
            : `${result.better === "ab" ? "Aktiebolaget" : "Enskild firma"} lämnar ${formatSek(Math.abs(result.difference))} mer kvar per år.`}
      </p>

      {result.netPerHour ? (
        <p className="q__help">
          Per arbetad timme: {formatSek(result.netPerHour.enskild)} som enskild firma,{" "}
          {formatSek(result.netPerHour.ab)} som aktiebolag.
        </p>
      ) : null}

      <div className="result__box">
        <Ledger result={result.enskild} />
      </div>
      <div className="result__box">
        <Ledger result={result.ab} />
      </div>

      <details className="assumptions" open>
        <summary>Vad uträkningen antar</summary>
        <ul>
          {result.assumptions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <p className="q__help">
        Vill du räkna på en annan bolagsform än de två?{" "}
        <Link href="/verktyg/bolagsform/">Bolagsformsväljaren</Link> väger in risk, delägare
        och hur du vill ta ut pengarna, inte bara skatten.
      </p>

    </>
  );
}

export function VadBlirKvarPartners() {
  const { input, result } = useTool();

  return (
    <>
      <PartnerCta
        heading="Passar ditt svar"
        partners={["bokio", "fortnox", "visma-eekonomi", "wint"]}
      />
      <EmailResult
        payload={{
          input,
          surplus: result.surplus,
          enskild: result.enskild.net,
          ab: result.ab.net,
        }}
        summary={`Vad blir kvar på ${formatSek(result.surplus)} i överskott: ${formatSek(result.enskild.net)} som enskild firma, ${formatSek(result.ab.net)} som aktiebolag`}
        tool="vad-blir-kvar"
      />
      <LeadForm collapsible sourcePage="/verktyg/vad-blir-kvar/" />
    </>
  );
}
