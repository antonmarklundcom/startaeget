"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Nav } from "@/lib/content/site";
import { SITE_NAME } from "@/lib/site";

/**
 * Header: wordmark + the primary nav from content/nav.ts, collapsing into a
 * drawer under 64rem. The drawer is a plain block under the header rather than
 * an overlay — no scroll lock, no focus trap, nothing to get wrong, and it
 * costs one boolean of client state.
 */
export function SiteHeader({ nav }: { nav: Nav }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header no-print">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand" onClick={() => setOpen(false)}>
          <span className="site-header__wordmark">
            Starta Eget <em>Företag</em>
          </span>
          <span className="site-header__tagline">Rätt val från första dagen</span>
        </Link>

        <nav className="site-nav" aria-label="Huvudmeny">
          <ul className="site-nav__list">
            {nav.primary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="site-nav__link"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="site-drawer"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="site-header__burger" aria-hidden="true" />
          <span>{open ? "Stäng" : "Meny"}</span>
        </button>
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
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
