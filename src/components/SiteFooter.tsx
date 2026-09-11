import Link from "next/link";
import type { Nav } from "@/lib/content/site";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SITE_NAME } from "@/lib/site";

/**
 * Footer: what the site is, who stands behind it, every hub and every legal
 * page. No placeholder text — the legal pages are real routes that S8 fills in.
 */
export function SiteFooter({ nav }: { nav: Nav }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer no-print">
      <div className="container site-footer__inner">
        <div className="site-footer__about">
          <p className="site-footer__wordmark">{SITE_NAME}</p>
          <p>
            Oberoende guider, jämförelser och räknare för dig som startar ditt första
            företag i Sverige. Vi tar ställning och visar siffrorna — och länkar alltid
            till Skatteverket, Bolagsverket eller Verksamt så att du kan kontrollera dem
            själv.
          </p>
          <p>
            Redaktionen nås på{" "}
            <a href="mailto:redaktionen@startaegetforetag.se">
              redaktionen@startaegetforetag.se
            </a>
            .
          </p>
        </div>

        <div className="site-footer__groups">
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
        </div>
      </div>

      <div className="container">
        <div className="site-footer__legal">
          <p>
            © {year} {SITE_NAME}. Vissa länkar till leverantörer är annonslänkar och
            märks med &quot;Annonslänk&quot; där de står. Det påverkar inte vilka
            produkter vi rekommenderar — läs{" "}
            <Link href="/annonspolicy/">annonspolicyn</Link>.
          </p>
          <p>
            Innehållet är allmän information, inte skatte- eller juridisk rådgivning.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** The newsletter band, used at the end of a page — never as a popup (§5.2). */
export function NewsletterBand({ source }: { source: string }) {
  return (
    <section className="newsletter no-print" aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading">Ett mejl när något faktiskt ändras</h2>
      <p>
        Nya avgifter, nya gränsbelopp, nya jämförelser. Vi skickar bara när det finns
        något att säga — och aldrig reklam för något vi inte själva skulle välja.
      </p>
      <NewsletterForm source={source} />
    </section>
  );
}
