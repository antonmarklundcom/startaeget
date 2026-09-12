"use client";

import { useState } from "react";

/**
 * "Få offert från en redovisningsbyrå" (plan §1.2 item 2). Posts to /api/lead,
 * which writes our own row first and forwards to VenderCRM when configured.
 *
 * `collapsible` renders the card as a one-line offer with a button instead of
 * the full form. The tools that always show a result (startkostnad,
 * vad-blir-kvar) use it, so a six-field form does not sit under the answer
 * before the visitor has asked for anything — the form opens on the click.
 */
export function LeadForm({
  sourcePage,
  collapsible = false,
}: {
  sourcePage: string;
  collapsible?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [open, setOpen] = useState(!collapsible);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "byra",
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          companyForm: String(data.get("companyForm") ?? ""),
          message: String(data.get("message") ?? ""),
          sourcePage,
          website: String(data.get("website") ?? ""),
        }),
      });
      setState(response.ok ? "done" : "error");
      if (response.ok) form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <section className="lead-form no-print" aria-labelledby="lead-form-heading">
      <h2 id="lead-form-heading">Få offert från en redovisningsbyrå</h2>
      <p>
        Beskriv kort din situation så återkommer en byrå med pris. Kostnadsfritt och
        utan att du binder dig till något.
      </p>

      {state === "done" ? (
        <p className="form__status" role="status">
          Tack! Vi har tagit emot din förfrågan och hör av oss inom ett par arbetsdagar.
        </p>
      ) : !open ? (
        <button
          type="button"
          className="btn btn--dark"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          Få offert
        </button>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          <div className="form__field">
            <label htmlFor="lead-name">Namn</label>
            <input id="lead-name" name="name" type="text" autoComplete="name" required />
          </div>
          <div className="form__field">
            <label htmlFor="lead-email">E-post</label>
            <input id="lead-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="form__field">
            <label htmlFor="lead-phone">Telefon (frivilligt)</label>
            <input id="lead-phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className="form__field">
            <label htmlFor="lead-form-type">Bolagsform</label>
            <select id="lead-form-type" name="companyForm" defaultValue="vet-inte">
              <option value="aktiebolag">Aktiebolag</option>
              <option value="enskild-firma">Enskild firma</option>
              <option value="handelsbolag">Handelsbolag</option>
              <option value="vet-inte">Vet inte än</option>
            </select>
          </div>
          <div className="form__field">
            <label htmlFor="lead-message">Vad behöver du hjälp med?</label>
            <textarea id="lead-message" name="message" required />
          </div>
          <input className="form__hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button type="submit" className="btn btn--dark" disabled={state === "sending"}>
            {state === "sending" ? "Skickar …" : "Skicka förfrågan"}
          </button>
          <p className="form__note">
            Vi lämnar dina uppgifter till en redovisningsbyrå som kan hjälpa dig. Läs mer i
            integritetspolicyn.
          </p>
          {state === "error" ? (
            <p className="form__status form__status--error" role="alert">
              Något gick fel när förfrågan skickades. Försök igen om en stund.
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
