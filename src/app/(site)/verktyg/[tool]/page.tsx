import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getTool } from "@/lib/content/site";
import { ToolShell } from "@/components/ToolShell";
import { buildMetadata } from "@/lib/seo";

/**
 * Routing and metadata for the three tools. O2 ships the shell; O3 passes the
 * live steps and result into it and flips `status` in content/tools.ts.
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

  return <ToolShell tool={tool} />;
}
