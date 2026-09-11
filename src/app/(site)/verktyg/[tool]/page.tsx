import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getTool } from "@/lib/content/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * Routing, metadata and JSON-LD for the three tools. O3 replaces the body with
 * the actual tool component and flips `status` to "live" in content/tools.ts.
 */

export const dynamicParams = false;

type Params = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return tools.map((tool) => ({ tool: tool.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tool: id } = await params;
  const tool = getTool(id);
  if (!tool) return {};
  return buildMetadata({
    title: tool.title,
    description: tool.description,
    path: tool.path,
  });
}

export default async function ToolPage({ params }: Params) {
  const { tool: id } = await params;
  const tool = getTool(id);
  if (!tool) notFound();

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
      <h1>{tool.title}</h1>
      <p className="tool__intro">{tool.intro}</p>
      {tool.status === "stub" ? (
        <p className="tool__stub">
          Räknaren läggs upp inom kort. Under tiden hittar du guiderna i{" "}
          <Link href="/starta-foretag/">Starta företag</Link>.
        </p>
      ) : null}
      <div id={`tool-${tool.id}`} data-tool={tool.id} />
    </div>
  );
}
