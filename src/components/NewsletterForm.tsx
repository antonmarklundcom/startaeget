"use client";

import { useState } from "react";

/**
 * The one soft conversion on a content page (plan §5.2, §1.2 item 3). Posts to
 * the O1 route; never a popup, never more than once per page.
 */
export function NewsletterForm({
  source,
  magnet,
  compact = false,
}: {
  source: string;
  magnet?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          source,
          magnet,
          website: String(data.get("website") ?? ""),
        }),
      });
      setState(response.ok ? "done" : "error");
      if (response.ok) form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="form__status" role="status">
        Tack! Kolla inkorgen — vi hör av oss när nästa guide är klar.
      </p>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className={compact ? "" : "newsletter__row"}>
        <div className="form__field">
          <label htmlFor={`nl-${source}`}>Din e-postadress</label>
          <input
            id={`nl-${source}`}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="du@företaget.se"
          />
        </div>
        <button type="submit" className="btn btn--primary" disabled={state === "sending"}>
          {state === "sending" ? "Skickar …" : "Prenumerera"}
        </button>
      </div>
      <input className="form__hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <p className="form__note">
        Ett mejl när vi publicerar något nytt. Inga annonsutskick, avsluta när du vill.
      </p>
      {state === "error" ? (
        <p className="form__status form__status--error" role="alert">
          Det gick inte att spara adressen just nu. Försök igen om en stund.
        </p>
      ) : null}
    </form>
  );
}
