"use client";

import { useMemo, useState } from "react";

/**
 * The "Infoga länk" picker: every article, hub and tool the site has, searchable,
 * inserting `[text](/slug/)`. The list comes from the loaders as props, so the
 * picker can never offer a link that does not resolve.
 */

export type LinkTarget = { href: string; label: string; kind: string };

export function LinkPicker({
  targets,
  onPick,
}: {
  targets: LinkTarget[];
  onPick: (target: LinkTarget) => void;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = needle
      ? targets.filter(
          (target) =>
            target.label.toLowerCase().includes(needle) ||
            target.href.toLowerCase().includes(needle),
        )
      : targets;
    return pool.slice(0, 40);
  }, [query, targets]);

  return (
    <div className="adm-picker">
      <label>
        <span>Sök sida</span>
        <input
          type="search"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="titel, hub eller adress"
        />
      </label>
      <ul>
        {matches.map((target) => (
          <li key={target.href}>
            <button type="button" className="adm-picker__hit" onClick={() => onPick(target)}>
              <strong>{target.label}</strong>
              <span className="adm-muted">
                {target.href} · {target.kind}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {matches.length === 0 ? <p className="adm-muted">Ingen sida matchar.</p> : null}
    </div>
  );
}
