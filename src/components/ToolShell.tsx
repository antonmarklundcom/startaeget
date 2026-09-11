import Link from "next/link";
import type { ToolDef } from "@/lib/content/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareResult } from "@/components/tools/ShareResult";
import { breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/jsonld";
import { constants } from "@/lib/tax/constants";

/**
 * The frame every tool page shares (docs/design/verkstan.md §2): the tinted,
 * sticky result panel on the left and the questions on the right, so all three
 * calculators read as one product.
 *
 * The shell stays a server component. Anything that needs the tool's live state
 * — the progress counter — comes in through the `progress` slot as a client
 * node, so the pages keep prerendering statically.
 */
/**
 * The date the footer line cites is derived from the constants themselves —
 * the newest check any of them carries — rather than typed here, so it cannot
 * drift from src/lib/tax/constants.ts (which D1 does not touch).
 */
const VERIFIED_ON = constants
  .map((item) => item.verifiedOn)
  .filter((date): date is string => Boolean(date))
  .sort()
  .at(-1);

export function ToolShell({
  tool,
  steps,
  result,
  partners,
  progress,
  disclaimer,
}: {
  tool: ToolDef;
  steps?: React.ReactNode;
  result?: React.ReactNode;
  partners?: React.ReactNode;
  progress?: React.ReactNode;
  disclaimer?: string;
}) {
  const crumbs = [
    { name: "Start", path: "/" },
    { name: "Verktyg", path: "/verktyg/" },
    { name: tool.title, path: tool.path },
  ];

  return (
    <div className="container tool" data-tint={tool.tint}>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={softwareApplicationJsonLd(tool)} />
      <Breadcrumbs crumbs={crumbs} />

      <div className="tool__head">
        <div>
          <h1>{tool.title}</h1>
          <p className="tool__intro">{tool.intro}</p>
        </div>
        {progress}
      </div>

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
          <p className="result__head">
            <span className="result__head-label">Ditt svar</span>
            <ShareResult />
          </p>
          {result ?? (
            <p className="tool__stub">
              Svaret visas här, med uträkningen och källorna utskrivna.
            </p>
          )}
        </section>
      </div>

      {partners ? <div className="tool__partners">{partners}</div> : null}

      <p className="tool__disclaimer chip chip--warning">
        {disclaimer ??
          "Uppskattning, inte rådgivning. Siffrorna bygger på Skatteverkets och Bolagsverkets egna uppgifter och kan ändras — kontrollera mot källan innan du fattar beslut."}
      </p>

      <p className="tool__footnote">
        Källor: Skatteverket · Bolagsverket · Verksamt.se
        {VERIFIED_ON
          ? ` — hämtade ${VERIFIED_ON}`
          : " — siffrorna är ännu inte kontrollerade mot myndigheternas egna sidor, se källrutan"}
      </p>
    </div>
  );
}
