"use client";

import { useState } from "react";

/**
 * "Dela ↗" (docs/design/verkstan.md §2). Every tool already writes its answers
 * into the address bar, so sharing a result is just copying that URL — this
 * chip does it in one click instead of asking the visitor to find the address
 * bar on a phone. No new state is invented; it reads what is already there.
 */
export function ShareResult() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied (insecure context, or the visitor said no). The URL is
      // in the address bar either way, so there is nothing to recover from.
      setCopied(false);
    }
  }

  return (
    <button className="chip result__share no-print" onClick={copy} type="button">
      {copied ? "Länk kopierad" : "Dela ↗"}
    </button>
  );
}
