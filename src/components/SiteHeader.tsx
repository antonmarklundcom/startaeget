"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Nav } from "@/lib/content/site";
import { SITE_NAME } from "@/lib/site";

/**
 * Header (docs/design/verkstan.md §2): accent tile + wordmark, the nav from
 * content/nav.ts as pills with the current section filled mint, and one dark
 * pill to the newsletter. No tagline, no bottom border.
 *
 * Under 64rem the nav collapses into O2's drawer — a plain block under the
 * header rather than an overlay, so there is no scroll lock and no focus trap
 * to get wrong. It still costs exactly one boolean of client state.
 */
export function SiteHeader({ nav }: { nav: Nav }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /** A section is current when the reader is on it or inside it. */
  const isCurrent = (href: string) => pathname === href;

  return (
    <header className="site-header no-print">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand" onClick={() => setOpen(false)}>
          <span className="site-header__mark" aria-hidden="true" />
          <span className="site-header__wordmark">{SITE_NAME}</span>
        </Link>

        <nav className="site-nav" aria-label="Huvudmeny">
          <ul className="site-nav__list">
            {nav.primary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    isCurrent(item.href) ? "site-nav__link is-current" : "site-nav__link"
                  }
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link className="btn btn--dark btn--small site-header__cta" href="/nyhetsbrev/">
            Nyhetsbrev
          </Link>
          <button
            type="button"
            className="site-header__toggle"
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Stäng" : "Meny"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="site-drawer" id="site-drawer">
          <nav className="container" aria-label={`${SITE_NAME} meny`}>
            <ul className="site-drawer__list">
              {nav.primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/nyhetsbrev/" onClick={() => setOpen(false)}>
                  Nyhetsbrev
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
