import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getTool } from "@/lib/content/site";
import { ToolFrame } from "@/components/tools/ToolFrame";
import {
  BolagsformPartners,
  BolagsformProvider,
  BolagsformResult,
  BolagsformSteps,
} from "@/components/tools/BolagsformTool";
import {
  StartkostnadPartners,
  StartkostnadProvider,
  StartkostnadResult,
  StartkostnadSteps,
} from "@/components/tools/StartkostnadTool";
import {
  VadBlirKvarPartners,
  VadBlirKvarProvider,
  VadBlirKvarResult,
  VadBlirKvarSteps,
} from "@/components/tools/VadBlirKvarTool";
import { buildMetadata } from "@/lib/seo";

/**
 * Routing and metadata for the three tools (plan §2.1). One route rather than
 * three directories, so the metadata, the JSON-LD and the shell are written
 * once; the switch below is the only place a tool id maps to its components.
 *
 * Each tool keeps its state in a client provider that wraps the shell, because
 * the questions and the result live in two different slots of it. The page
 * itself stays a static server component — the tools read their URL state on
 * mount instead of through searchParams, so nothing here opts into dynamic
 * rendering.
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

  if (id === "bolagsform") {
    return (
      <BolagsformProvider>
        <ToolFrame
          partners={<BolagsformPartners />}
          result={<BolagsformResult />}
          steps={<BolagsformSteps />}
          tool={tool}
        />
      </BolagsformProvider>
    );
  }

  if (id === "startkostnad") {
    return (
      <StartkostnadProvider>
        <ToolFrame
          disclaimer="Uppskattning, inte rådgivning. Myndighetsavgifterna är Bolagsverkets och Skatteverkets egna; övriga poster är marknadspriser som varierar mellan leverantörer — kontrollera mot leverantören innan du räknar hem något."
          partners={<StartkostnadPartners />}
          result={<StartkostnadResult />}
          steps={<StartkostnadSteps />}
          tool={tool}
        />
      </StartkostnadProvider>
    );
  }

  if (id === "vad-blir-kvar") {
    return (
      <VadBlirKvarProvider>
        <ToolFrame
          disclaimer="Uppskattning, inte rådgivning. Grundavdrag och jobbskatteavdrag är förenklade, och uträkningen tar ingen hänsyn till pension, sjukpenning eller annan inkomst. Vill du ha en exakt siffra för just dig — fråga en redovisningsbyrå."
          partners={<VadBlirKvarPartners />}
          result={<VadBlirKvarResult />}
          steps={<VadBlirKvarSteps />}
          tool={tool}
        />
      </VadBlirKvarProvider>
    );
  }

  notFound();
}
