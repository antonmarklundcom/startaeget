"use client";

import { useState } from "react";
import { NewsletterForm } from "@/components/NewsletterForm";

/**
 * The lead-magnet gate (plan §5.5). A printable mall or checklist is the thing
 * we trade for an e-mail address, so the body sits behind the newsletter form —
 * but only behind client state, never behind a server check: the value is the
 * list, not the secrecy of a checklist. Search engines and anyone who reads the
 * HTML get the whole page, which is also why it belongs in the sitemap.
 *
 * Wraps the ordinary `PageTemplate` output, so a lead magnet renders with the
 * same template, type and print behaviour as every other page.
 */
export function NewsletterGate({
  slug,
  title,
  description,
  children,
}: {
  slug: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? null : (
        <div className="container" data-hub="sand">
          <section className="panel" aria-labelledby="gate-heading">
            <p className="eyebrow">Gratis nedladdning</p>
            <h1 id="gate-heading">{title}</h1>
            <p className="lede">{description}</p>
            <NewsletterForm source={`/${slug}/`} magnet={slug} />
            <p className="form__note">
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(true)}>
                Visa utan att prenumerera
              </button>
            </p>
          </section>
        </div>
      )}
      <div hidden={!open}>{children}</div>
    </>
  );
}
