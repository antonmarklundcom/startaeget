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

export default function ToolsHubPage() {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: "Verktyg", path: "/verktyg/" },
  ];

  return (
    <div className="container hub">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <p className="eyebrow">Räknare</p>
      <h1>Verktyg</h1>
      <p className="hub__intro">
        Tre räknare som tar dig från fråga till beslut. Alla siffror bygger på
        Skatteverkets och Bolagsverkets egna uppgifter, med datum för när vi
        kontrollerade dem.
      </p>
      <div className="bento">
        {tools.map((tool, index) => (
          <Link
            key={tool.id}
            href={tool.path}
            className={index === 0 ? "bento__item bento__item--lead" : "bento__item"}
          >
            <span className="bento__step">Steg {index + 1}</span>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <span className="bento__cue">Öppna räknaren →</span>
          </Link>
        ))}
      </div>
      <NewsletterBand source="/verktyg/" />
    </div>
  );
}
