import Link from "next/link";
import type { ToolDef } from "@/lib/content/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/jsonld";

/**
 * The frame every tool page shares (plan §5.2): title, the steps column, the
 * result panel and the partner area under it. O3 fills `steps` and `result`
 * with the live client components; the shell, its layout and its disclaimer are
 * settled here so all three tools look like one product.
 */
export function ToolShell({
  tool,
  steps,
  result,
  partners,
  disclaimer,
}: {
  tool: ToolDef;
  steps?: React.ReactNode;
  result?: React.ReactNode;
  partners?: React.ReactNode;
  disclaimer?: string;
}) {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: "Verktyg", path: "/verktyg/" },
    { name: tool.title, path: tool.path },
  ];

  return (
    <div className="container tool">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={softwareApplicationJsonLd(tool)} />
      <Breadcrumbs crumbs={crumbs} />

      <p className="eyebrow">Verktyg</p>
      <h1>{tool.title}</h1>
      <p className="tool__intro">{tool.intro}</p>

      <div className="tool__layout">
        <section className="tool__steps" aria-label="Frågor">
          {steps ?? (
            <p className="tool__stub">
              Räknaren läggs upp inom kort. Under tiden tar guiderna i{" "}
              <Link href="/starta-foretag/">Starta företag</Link> dig igenom samma val
              för hand.
            </p>
          )}
        </section>

        <section className="tool__result" aria-label="Resultat">
          {result ?? (
            <p className="tool__stub">
              Svaret visas här, med uträkningen och källorna utskrivna.
            </p>
          )}
          {partners}
        </section>
      </div>

      <p className="tool__disclaimer">
        {disclaimer ??
          "Uppskattning, inte rådgivning. Siffrorna bygger på Skatteverkets och Bolagsverkets egna uppgifter och kan ändras — kontrollera mot källan innan du fattar beslut."}
      </p>
    </div>
  );
}
