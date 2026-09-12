import { githubConfig } from "./store";

/**
 * Which commit the running build was made from. Hostinger rebuilds on push, so
 * a file whose blob on the branch differs from the blob in that commit's tree is
 * saved but not yet live — that is the "väntar på bygge" chip (plan §5.5).
 *
 * `NEXT_PUBLIC_BUILD_SHA` is written at build time. Without it there is nothing
 * to compare against and the chip is simply omitted.
 */

export function buildSha(): string | null {
  return process.env.NEXT_PUBLIC_BUILD_SHA?.trim() || null;
}

let cache: { at: number; sha: string; tree: Map<string, string> } | null = null;

export async function deployedBlobs(): Promise<Map<string, string> | null> {
  const config = githubConfig();
  const sha = buildSha();
  if (!config || !sha) return null;
  if (cache && cache.sha === sha && Date.now() - cache.at < 60_000) return cache.tree;

  const response = await fetch(
    `https://api.github.com/repos/${config.repo}/git/trees/${encodeURIComponent(sha)}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "startaegetforetag-admin",
      },
      cache: "no-store",
    },
  );
  if (!response.ok) return null;
  const body = (await response.json()) as { tree?: { path: string; sha: string }[] };
  const tree = new Map<string, string>();
  for (const entry of body.tree ?? []) tree.set(entry.path, entry.sha);
  cache = { at: Date.now(), sha, tree };
  return tree;
}
