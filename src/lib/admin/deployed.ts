import { githubApi } from "./github";

/**
 * Which commit the running build was made from. Hostinger rebuilds on push, so a
 * file whose blob on the branch differs from the blob in that commit's tree is
 * saved but not yet live — that is the "väntar på bygge" chip (plan §5.5).
 *
 * `NEXT_PUBLIC_BUILD_SHA` is written at build time. Without it there is nothing
 * to compare against, and the list says the state is unknown rather than guessing.
 */

export function buildSha(): string | null {
  return process.env.NEXT_PUBLIC_BUILD_SHA?.trim() || null;
}

export async function deployedBlobs(): Promise<Map<string, string> | null> {
  const api = githubApi();
  const sha = buildSha();
  if (!api || !sha) return null;
  return api.treeBlobs(sha);
}
