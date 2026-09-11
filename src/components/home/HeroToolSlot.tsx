import Link from "next/link";
import { QUESTIONS } from "@/lib/tax/bolagsform";

/**
 * The live first question of Bolagsformsväljaren in the home hero (plan §5.3).
 * It renders from QUESTIONS[0] rather than a copy of it, so the question on the
 * home page can never drift from the question in the tool, and each option links
 * into the tool with that answer already recorded — the tool reads it from the
 * URL and opens on question 2.
 *
 * Plain links, so the hero costs no JavaScript and works before hydration.
 * The progress bar has one segment per real question, the first one filled.
 */
export function HeroToolSlot() {
  const [question] = QUESTIONS;

  return (
    <div className="tool-slot" data-slot="bolagsform-q1" id="hero-tool-slot">
      <p className="tool-slot__head">
        <span className="tool-slot__label">Bolagsformsväljaren</span>
        <span className="tool-slot__count">1 av {QUESTIONS.length}</span>
      </p>
      <span className="tool-slot__progress" aria-hidden="true">
        {QUESTIONS.map((item) => (
          <span key={item.id} />
        ))}
      </span>
      <p className="tool-slot__question">{question.title}</p>
      <div className="tool-slot__options">
        {question.options.map((option) => (
          <Link
            href={`/verktyg/bolagsform/?${question.key}=${option.id}`}
            key={option.id}
          >
            <span>{option.label}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
      <p className="tool-slot__foot">
        {QUESTIONS.length} frågor, ett svar med motiveringen utskriven. Inget konto, inget
        mejl.
      </p>
    </div>
  );
}
