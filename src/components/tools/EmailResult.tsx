"use client";

import { useState } from "react";

/**
 * "Mejla mig resultatet" (plan §5.3). Posts to /api/tool-result, which stores
 * the row and only sends mail once RESEND_API_KEY exists — so this degrades to
 * DB-only without the visitor being promised something that will not arrive.
 */
export function EmailResult({
  tool,
  payload,
  summary,
}: {
  tool: "bolagsform" | "startkostnad" | "vad-blir-kvar";
  payload: Record<string, unknown>;
  summary: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [mailed, setMailed] = useState(true);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    try {
      const response = await fetch("/api/tool-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          email: String(data.get("email") ?? ""),
          subscribe: data.get("subscribe") === "on",
          website: String(data.get("website") ?? ""),
          payload: { ...payload, summary, url: window.location.href },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok) {
        setMailed(Boolean(body.mailConfigured));
        setState("done");
        form.reset();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="email-result">
        <p className="form__status" role="status">
          {mailed
            ? "Klart — resultatet är på väg till din inkorg."
            : "Tack! Vi har sparat ditt resultat och skickar det så snart utskicken är igång."}
        </p>
      </div>
    );
  }

  return (
    <form className="email-result" onSubmit={onSubmit}>
      <h2>Mejla mig resultatet</h2>
      <p>Få uträkningen och länkarna i ett mejl, så slipper du spara fliken.</p>
      <div className="email-result__row">
        <label className="tool-sr" htmlFor={`email-${tool}`}>
          Din e-postadress
        </label>
        <input
          id={`email-${tool}`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="din@epost.se"
          required
        />
        <button className="btn btn--primary" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Skickar …" : "Skicka"}
        </button>
      </div>
      <label className="email-result__consent">
        <input name="subscribe" type="checkbox" />
        <span>
          Skicka mig också nyhetsbrevet med guider för nya företagare. Du kan avregistrera
          dig när du vill.
        </span>
      </label>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="form__hp"
        name="website"
        tabIndex={-1}
        type="text"
      />
      {state === "error" ? (
        <p className="form__status form__status--error" role="alert">
          Det gick inte att skicka just nu. Försök igen om en stund.
        </p>
      ) : null}
    </form>
  );
}
