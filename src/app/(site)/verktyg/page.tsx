import Link from "next/link";
import type { Metadata } from "next";
import { tools } from "@/lib/content/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterBand } from "@/components/SiteFooter";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Verktyg för dig som startar företag",
  description:
    "Tre kostnadsfria verktyg: välj bolagsform, räkna ut startkostnaden och se vad som blir kvar efter skatt och avgifter.",
  path: "/verktyg/",
});

/** The tools room: mint head panel, the three full tool cards (contract §2). */
export default function ToolsHubPage() {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: "Verktyg", path: "/verktyg/" },
  ];

  return (
    <div className="container hub" data-hub="verktyg">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />

      <header className="head-panel">
        <p className="chip-row">
          <span className="chip">{tools.length} verktyg</span>
          <span className="chip chip--source">Inga konton · källa på varje siffra</span>
        </p>
        <h1>Verktyg</h1>
        <p className="lede">
          Tre räknare som hjälper dig från fråga till beslut. Myndighetsbeloppen har
          källhänvisningar till bland annat Skatteverket och Bolagsverket, men är ännu
          inte kontrollerade mot källorna. Leverantörspriser i startkostnadskalkylatorn
          är uppskattningar inom marknadsspann.
        </p>
      </header>

      <ul className="tool-cards" style={{ marginBlockStart: "var(--space-4)" }}>
        {tools.map((tool, index) => (
          <li key={tool.id}>
            <Link className="tool-card" data-tint={tool.tint} href={tool.path}>
              <span className="tool-card__tile" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="tool-card__title">{tool.title}</h2>
              <p className="tool-card__desc">{tool.description}</p>
              <span className="tool-card__foot">
                <span className="tool-card__minutes">{tool.minutes} minuter</span>
                <span className="tool-card__go">Starta</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <NewsletterBand source="/verktyg/" />
    </div>
  );
}
