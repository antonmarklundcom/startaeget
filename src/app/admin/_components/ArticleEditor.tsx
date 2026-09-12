"use client";

import { useActionState, useRef, useState } from "react";
import { saveArticleAction, createArticleAction, previewAction, type SaveState } from "../actions";
import type { PreviewResult } from "@/lib/admin/preview";
import { LinkPicker, type LinkTarget } from "./LinkPicker";

/**
 * The editor (plan §5.5). Every frontmatter field is a form control, the body is
 * a plain textarea with a snippet toolbar, and the preview is the site's own MDX
 * pipeline rendered by a server action. No editor dependency — on purpose: a
 * rich-text field that writes its own MDX is the thing that breaks the build.
 */

export type EditorArticle = {
  hub: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  intent: string;
  updated: string;
  sources: { label: string; url: string }[];
  partners: string[];
  related: string[];
  faq: { q: string; a: string }[];
  image?: { slot: string; alt: string };
  legacy: boolean;
  draft: boolean;
  body: string;
  sha?: string;
};

export type EditorOptions = {
  hubs: { id: string; title: string }[];
  types: string[];
  partners: { id: string; name: string }[];
  articles: { slug: string; title: string }[];
  linkTargets: LinkTarget[];
};

const ROW_LIMIT = 20;

export function ArticleEditor({
  article,
  options,
  mode,
  justCreated = false,
}: {
  article: EditorArticle;
  options: EditorOptions;
  mode: "edit" | "create";
  justCreated?: boolean;
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(
    mode === "create" ? createArticleAction : saveArticleAction,
    {},
  );
  const [preview, previewFormAction, previewPending] = useActionState<PreviewResult | null, FormData>(
    previewAction,
    null,
  );

  const [sources, setSources] = useState(
    article.sources.length ? article.sources : [{ label: "", url: "" }],
  );
  const [faq, setFaq] = useState(article.faq);
  const [body, setBody] = useState(article.body);
  const [pickerOpen, setPickerOpen] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  /**
   * The blob sha this form saves against: the one the page loaded until a
   * github save returns a newer one. Without it a second save in the same page
   * would arrive with a stale sha and get GitHub's 409.
   */
  const sha = state.sha ?? article.sha;

  /** Inserts at the caret, which is the only reason the toolbar needs JS. */
  function insert(snippet: string, selectionOffset = snippet.length) {
    const textarea = bodyRef.current;
    if (!textarea) {
      setBody((current) => `${current}\n${snippet}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${body.slice(0, start)}${snippet}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + selectionOffset, start + selectionOffset);
    });
  }

  return (
    <>
      <form className="adm-form adm-editor" action={action}>
        <input type="hidden" name="existing-slug" value={mode === "edit" ? article.slug : ""} />
        {sha ? <input type="hidden" name="sha" value={sha} /> : null}
        <input type="hidden" name="legacy" value={article.legacy ? "true" : "false"} />

        <div className="adm-grid">
          <label className="adm-span2">
            <span>Titel (max 60 tecken)</span>
            <input name="title" defaultValue={article.title} maxLength={60} required />
          </label>

          <label>
            <span>Adress (slug)</span>
            <input
              name="slug"
              defaultValue={article.slug}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              readOnly={mode === "edit"}
            />
            {mode === "edit" ? (
              <small className="adm-muted">
                Adressen är filnamnet. Byt adress genom att skapa en ny post och ta bort den här.
              </small>
            ) : null}
          </label>

          <label>
            <span>Hub</span>
            <select name="hub" defaultValue={article.hub} required>
              {options.hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Typ</span>
            <select name="type" defaultValue={article.type} required>
              {options.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Uppdaterad</span>
            <input name="updated" type="date" defaultValue={article.updated} />
            <input type="hidden" name="loaded-updated" value={article.updated} />
            <small className="adm-muted">
              Rör du inte fältet sätts dagens datum när du sparar.
            </small>
          </label>

          <label className="adm-span2">
            <span>Metabeskrivning (50–155 tecken)</span>
            <textarea name="description" rows={2} defaultValue={article.description} required />
          </label>

          <label className="adm-span2">
            <span>Sökintention — den enda fråga sidan ska äga</span>
            <input name="intent" defaultValue={article.intent} required />
          </label>

          <label>
            <span>Bildslot</span>
            <input name="image-slot" defaultValue={article.image?.slot ?? ""} />
          </label>
          <label>
            <span>Bildens alt-text</span>
            <input name="image-alt" defaultValue={article.image?.alt ?? ""} />
          </label>

          <div className="adm-span2 adm-row">
            <label className="adm-check">
              <input type="checkbox" name="draft" defaultChecked={article.draft} /> Utkast (visas
              inte på sajten)
            </label>
            <span className="adm-muted">
              legacy: <strong>{article.legacy ? "ja" : "nej"}</strong> (läsvärde — sätts när sidan
              fanns på den gamla sajten)
            </span>
          </div>
        </div>

        <fieldset className="adm-fieldset">
          <legend>Källor</legend>
          {sources.map((source, index) => (
            <div className="adm-row" key={index}>
              <input
                name={`source-label-${index}`}
                defaultValue={source.label}
                placeholder="Bolagsverket — Registrera aktiebolag"
                aria-label={`Källa ${index + 1}, etikett`}
              />
              <input
                name={`source-url-${index}`}
                defaultValue={source.url}
                placeholder="https://bolagsverket.se/…"
                aria-label={`Källa ${index + 1}, adress`}
              />
            </div>
          ))}
          <button
            type="button"
            className="adm-btn adm-btn--quiet"
            onClick={() =>
              setSources((rows) =>
                rows.length < ROW_LIMIT ? [...rows, { label: "", url: "" }] : rows,
              )
            }
          >
            + Lägg till källa
          </button>
        </fieldset>

        <fieldset className="adm-fieldset">
          <legend>Vanliga frågor (blir FAQ-strukturdata)</legend>
          {faq.map((item, index) => (
            <div className="adm-row adm-row--stack" key={index}>
              <input
                name={`faq-q-${index}`}
                defaultValue={item.q}
                placeholder="Frågan, som någon faktiskt skulle söka på"
                aria-label={`Fråga ${index + 1}`}
              />
              <textarea
                name={`faq-a-${index}`}
                rows={2}
                defaultValue={item.a}
                placeholder="Svaret, i två–tre meningar"
                aria-label={`Svar ${index + 1}`}
              />
            </div>
          ))}
          <button
            type="button"
            className="adm-btn adm-btn--quiet"
            onClick={() => setFaq((rows) => (rows.length < ROW_LIMIT ? [...rows, { q: "", a: "" }] : rows))}
          >
            + Lägg till fråga
          </button>
        </fieldset>

        <div className="adm-columns">
          <fieldset className="adm-fieldset">
            <legend>Partners (annonsslottar)</legend>
            <div className="adm-checks">
              {options.partners.map((partner) => (
                <label className="adm-check" key={partner.id}>
                  <input
                    type="checkbox"
                    name="partners"
                    value={partner.id}
                    defaultChecked={article.partners.includes(partner.id)}
                  />{" "}
                  {partner.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="adm-fieldset">
            <legend>Relaterade artiklar</legend>
            <div className="adm-checks adm-checks--tall">
              {options.articles
                .filter((item) => item.slug !== article.slug)
                .map((item) => (
                  <label className="adm-check" key={item.slug}>
                    <input
                      type="checkbox"
                      name="related"
                      value={item.slug}
                      defaultChecked={article.related.includes(item.slug)}
                    />{" "}
                    {item.title}
                  </label>
                ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="adm-fieldset">
          <legend>Text (MDX)</legend>
          <div className="adm-toolbar">
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={() => setPickerOpen((open) => !open)}
            >
              Infoga länk
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={() =>
                insert('<Callout title="Kom ihåg">\n\nText här.\n\n</Callout>\n', 24)
              }
            >
              Callout
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={() => insert('<Checklist items={["Första punkten", "Andra punkten"]} />\n', 21)}
            >
              Checklist
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={() => insert('<Stat k="bolagsskatt" />\n', 9)}
            >
              Stat
            </button>
          </div>

          {pickerOpen ? (
            <LinkPicker
              targets={options.linkTargets}
              onPick={(target) => {
                insert(`[${target.label}](${target.href})`);
                setPickerOpen(false);
              }}
            />
          ) : null}

          <textarea
            ref={bodyRef}
            name="body"
            className="adm-body"
            rows={26}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />
        </fieldset>

        <div className="adm-actions">
          <button
            type="submit"
            className="adm-btn adm-btn--primary"
            disabled={pending}
            data-testid="save"
          >
            {pending ? "Sparar …" : mode === "create" ? "Skapa posten" : "Spara"}
          </button>
          <button
            type="submit"
            className="adm-btn"
            formAction={previewFormAction}
            /* The preview reads only the body, so an unfinished frontmatter
               field must not stop the browser from submitting it. */
            formNoValidate
            disabled={previewPending}
            data-testid="preview"
          >
            {previewPending ? "Förhandsgranskar …" : "Förhandsgranska"}
          </button>
        </div>

        {justCreated ? (
          <p className="adm-chip adm-chip--ok" data-testid="created">
            Posten är skapad.
          </p>
        ) : null}
        {state.message ? (
          <p
            className={state.ok ? "adm-chip adm-chip--ok" : "adm-chip adm-chip--error"}
            role="status"
            data-testid="save-state"
          >
            {state.message}
          </p>
        ) : null}
        {state.errors?.length ? (
          <ul className="adm-errors" role="alert" data-testid="save-errors">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
        {state.warnings?.length ? (
          <ul className="adm-warnings">
            {state.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </form>

      {preview ? (
        <section className="adm-preview" aria-label="Förhandsgranskning">
          <h2>Förhandsgranskning</h2>
          {preview.ok ? (
            <div className="prose">{preview.node}</div>
          ) : (
            <pre className="adm-errors">{preview.error}</pre>
          )}
        </section>
      ) : null}
    </>
  );
}
