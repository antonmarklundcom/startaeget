import Link from "next/link";
import { nav } from "@/lib/content/site";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * Layout shell only — header, footer and the sitewide JSON-LD. O2 replaces the
 * markup inside with the real design system.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <a href="#main" className="skip-link">
        Hoppa till innehållet
      </a>
      <header>
        <div className="container site-header">
          <Link href="/" className="site-header__brand">
            <strong>{SITE_NAME}</strong>
            <span>{SITE_TAGLINE}</span>
          </Link>
          <nav aria-label="Huvudmeny">
            <ul>
              {nav.primary.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer>
        <div className="container site-footer">
          {nav.footer.map((group) => (
            <section key={group.heading}>
              <h2>{group.heading}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="site-footer__legal">
            {SITE_NAME} — oberoende guider för nyföretagare. Vissa länkar är
            annonslänkar, se{" "}
            <Link href="/annonspolicy/">annonspolicyn</Link>.
          </p>
        </div>
      </footer>
    </>
  );
}
