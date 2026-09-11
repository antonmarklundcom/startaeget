"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FORM_NAMES,
  QUESTIONS,
  fromQuery,
  getOption,
  nextSteps,
  partnersFor,
  recommend,
  toQuery,
  type Answers,
  type CompanyForm,
  type Recommendation,
} from "@/lib/tax/bolagsform";
import { PartnerCta } from "@/components/PartnerCta";
import { LeadForm } from "@/components/LeadForm";
import { EmailResult } from "./EmailResult";
import { ToolSources } from "./ToolSources";

/**
 * Tool 1, Bolagsformsväljaren (plan §5.3). One question at a time, every answer
 * in the URL so a result can be shared or reloaded, and the home hero links in
 * with question 1 already answered.
 *
 * The questions and the result sit in two different slots of O2's ToolShell, so
 * the state they share travels by context: the page wraps the shell in
 * <BolagsformProvider> and drops <BolagsformSteps/> and <BolagsformResult/> into
 * the slots. That keeps the shell's layout O2's and the state O3's.
 */

const SOURCE_KEYS = [
  "bolagsskatt",
  "egenavgifter",
  "arbetsgivaravgifter",
  "aktiekapital-minimum",
  "bolagsverket-ab-nyregistrering",
  "bolagsverket-enskild-firma",
  "utdelning-grundbelopp",
];

const READ_NEXT: Record<CompanyForm, { href: string; label: string }> = {
  ab: { href: "/starta-aktiebolag/", label: "Så startar du aktiebolag, steg för steg" },
  enskild: { href: "/starta-foretag/", label: "Guiderna för dig som startar eget" },
  handelsbolag: { href: "/starta-foretag/", label: "Guiderna för dig som startar eget" },
};

type State = {
  answers: Answers;
  result: Recommendation;
  index: number;
  ready: boolean;
  pick: (questionId: string, optionId: string) => void;
  goTo: (index: number) => void;
  reset: () => void;
};

const BolagsformContext = createContext<State | null>(null);

function useTool(): State {
  const state = useContext(BolagsformContext);
  if (!state) throw new Error("Bolagsform components must be inside <BolagsformProvider>");
  return state;
}

export function BolagsformProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  // Read the URL once on mount rather than with useSearchParams, so the page
  // itself stays statically rendered.
  useEffect(() => {
    const initial = fromQuery(new URLSearchParams(window.location.search));
    setAnswers(initial);
    const firstUnanswered = QUESTIONS.findIndex((question) => !initial[question.id]);
    setIndex(firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered);
    setReady(true);
  }, []);

  const result = useMemo(() => recommend(answers), [answers]);

  // Keep the address bar in step without one history entry per click.
  useEffect(() => {
    if (!ready) return;
    const query = toQuery(answers);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [answers, ready]);

  const pick = useCallback((questionId: string, optionId: string) => {
    setAnswers((current) => {
      const updated = { ...current, [questionId]: optionId };
      const nextUnanswered = QUESTIONS.findIndex((question) => !updated[question.id]);
      setIndex(nextUnanswered === -1 ? QUESTIONS.length - 1 : nextUnanswered);
      return updated;
    });
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(next, QUESTIONS.length - 1)));
  }, []);

  const reset = useCallback(() => {
    setAnswers({});
    setIndex(0);
  }, []);

  const value = useMemo(
    () => ({ answers, result, index, ready, pick, goTo, reset }),
    [answers, result, index, ready, pick, goTo, reset],
  );

  return <BolagsformContext.Provider value={value}>{children}</BolagsformContext.Provider>;
}

export function BolagsformSteps() {
  const { answers, result, index, pick, goTo, reset } = useTool();
  const done = result.form !== null;
  const current = QUESTIONS[Math.min(index, QUESTIONS.length - 1)];
  const answered = QUESTIONS.filter((question) => answers[question.id]);

  return (
    <div className="q">
      <p className="q__progress">
        <span>
          Fråga {Math.min(result.answered + (done ? 0 : 1), QUESTIONS.length)} av{" "}
          {QUESTIONS.length}
        </span>
        <span aria-hidden="true" className="q__bar">
          <span style={{ width: `${(result.answered / QUESTIONS.length) * 100}%` }} />
        </span>
      </p>

      {done ? (
        <p className="q__help" data-testid="all-answered">
          Alla frågor är besvarade. Ändra ett svar nedan om något inte stämmer — resultatet
          räknas om direkt.
        </p>
      ) : (
        <fieldset className="q__options">
          <legend className="q__title">{current.title}</legend>
          {current.help ? <p className="q__help">{current.help}</p> : null}
          {current.options.map((option) => {
            const selected = answers[current.id] === option.id;
            return (
              <button
                aria-pressed={selected}
                className="q__option"
                data-option={option.id}
                key={option.id}
                onClick={() => pick(current.id, option.id)}
                type="button"
              >
                <span aria-hidden="true" className="q__option-mark">
                  {selected ? "✓" : ""}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </fieldset>
      )}

      {index > 0 && !done ? (
        <div className="q__nav">
          <button className="btn btn--ghost" onClick={() => goTo(index - 1)} type="button">
            ← Föregående fråga
          </button>
        </div>
      ) : null}

      {answered.length ? (
        <div className="answers">
          {answered.map((question) => {
            const option = getOption(question.id, answers[question.id]);
            const position = QUESTIONS.indexOf(question);
            return (
              <div className="answers__row" key={question.id}>
                <span>
                  <span className="answers__q">{position + 1}. </span>
                  {option?.label}
                </span>
                <button onClick={() => goTo(position)} type="button">
                  Ändra
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="tool__actions">
        <button className="btn btn--ghost" onClick={reset} type="button">
          Börja om
        </button>
      </div>
    </div>
  );
}

export function BolagsformResult() {
  const { answers, result } = useTool();
  const form = result.form;

  if (!form) {
    return (
      <>
        <div className="result__verdict">
          <span className="result__label">Resultat</span>
          <p className="result__form">Svara på frågorna</p>
        </div>
        <p className="q__help">
          Förslaget visas här när alla {QUESTIONS.length} frågor är besvarade, tillsammans
          med motiveringen och vad du gör härnäst.
        </p>
        <ToolSources keys={SOURCE_KEYS} />
      </>
    );
  }

  return (
    <>
      <div className="result__verdict">
        <span className="result__label">Vårt förslag</span>
        <p className="result__form" data-testid="verdict">
          {FORM_NAMES[form]}
        </p>
        <span className="result__estimate">Uppskattning, inte rådgivning</span>
      </div>

      {result.close && result.runnerUp ? (
        <p className="result__tie">
          Det är nära mellan {FORM_NAMES[form].toLowerCase()} och{" "}
          {FORM_NAMES[result.runnerUp].toLowerCase()} i ditt fall. Läs motiveringen nedan och
          väg själv — eller fråga en byrå innan du registrerar.
        </p>
      ) : null}

      <h2 className="result__label">Därför</h2>
      <ul className="result__why">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>

      {result.excluded.length ? (
        <p className="q__help">
          Uteslutet av dina svar:{" "}
          {result.excluded.map((excluded) => FORM_NAMES[excluded]).join(", ")}.
        </p>
      ) : null}

      <h2 className="result__label">Så här gör du</h2>
      <ol className="result__steps">
        {nextSteps(form).map((step) => (
          <li key={step}>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="q__help">
        Läs vidare: <Link href={READ_NEXT[form].href}>{READ_NEXT[form].label}</Link>
      </p>

      <ToolSources keys={SOURCE_KEYS} />

      <EmailResult
        payload={{ answers, form, scores: result.scores }}
        summary={`Bolagsformsväljaren föreslår ${FORM_NAMES[form]}`}
        tool="bolagsform"
      />
    </>
  );
}

export function BolagsformPartners() {
  const { result } = useTool();
  if (!result.form) return null;
  return (
    <>
      <PartnerCta heading="Det här behöver du härnäst" partners={partnersFor(result.form)} />
      <LeadForm sourcePage="/verktyg/bolagsform/" />
    </>
  );
}
