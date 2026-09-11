import "./tools.css";

import type { ToolDef } from "@/lib/content/site";
import { ToolShell } from "@/components/ToolShell";

/**
 * Thin wrapper around O2's ToolShell whose only job is to pull in the O3 tool
 * stylesheet once, wherever a tool renders. Keeping the import here means the
 * CSS ships with the tools and stays inside O3's Owns block (plan §4.9).
 */
export function ToolFrame(props: {
  tool: ToolDef;
  steps?: React.ReactNode;
  result?: React.ReactNode;
  partners?: React.ReactNode;
  progress?: React.ReactNode;
  disclaimer?: string;
}) {
  return <ToolShell {...props} />;
}
