import Link from "next/link";
import { home, type Nav } from "@/lib/content/site";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SITE_NAME } from "@/lib/site";

/**
 * Footer (docs/design/verkstan.md §2): the three nav.footer groups stay, since
 * they carry the hub and legal links, but quietly — 13 px, muted, no background
 * and no border. Under them the two lines the design asks for: who we cite, and
 * the legal line.
 */
export function SiteFooter({ nav }: { nav: Nav }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer no-print">
      <div className="container">
        <div className="site-footer__groups">
          {nav.footer.map((group) => (
            <section key={group.heading}>
              <h2>{group.heading}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} prefetch={false}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="site-footer__legal">
          <p>
            Källor vi citerar: {home.trustRow.map((item) => item.label).join(" · ")}
          </p>
          <p>
            © {year} {SITE_NAME} · <Link href="/annonspolicy/" prefetch={false}>Annonspolicy</Link> ·{" "}
            <Link href="/integritetspolicy/" prefetch={false}>Integritet</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * The sun newsletter band (docs/design/verkstan.md §2). Never a popup: it ends
 * the home page, every article and every hub, and nothing else.
 */
export function NewsletterBand({ source }: { source: string }) {
  return (
    <section className="band no-print" aria-labelledby="newsletter-heading">
      <div className="band__inner">
        <div>
          <h2 id="newsletter-heading">Häng med. Ett mejl i månaden.</h2>
          <p>
            Ett mejl i månaden om det som ändras för dig som driver eget. Inga nyhetsbrev
            om nyhetsbrev.
          </p>
        </div>
        <NewsletterForm source={source} />
      </div>
    </section>
  );
}

/** The same band, one row high, for the foot of a long page. */
export function NewsletterStrip({ source }: { source: string }) {
  return (
    <section className="band band--strip no-print" aria-labelledby="newsletter-strip-heading">
      <div className="band__inner">
        <p className="band__line" id="newsletter-strip-heading">
          Ett mejl i månaden om det som ändras för dig som driver eget.
        </p>
        <NewsletterForm source={source} compact />
      </div>
    </section>
  );
}
