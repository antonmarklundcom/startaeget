import { getFlatEntries } from "./content";
import { legacyEntries, HUB_PATHS, type Redirect } from "./redirects";

/**
 * A legacy path we intend to keep but have not rewritten yet must never 404
 * (plan §1.4): until its article exists it 301s to its hub.
 *
 * This is computed from the content on disk at build time, so the redirect
 * disappears by itself the moment a lane 2 phase adds the article.
 *
 * A legacy path that is now a hub path (`/affarside/`) already answers 200 from
 * the hub route even though no article or page carries that slug — redirecting
 * it to its own hub would be a self-redirect loop, so those are skipped.
 */
export function missingLegacyRedirects(): Redirect[] {
  const existing = new Set(getFlatEntries().map((entry) => entry.slug));
  const hubPaths = new Set(Object.values(HUB_PATHS));

  return legacyEntries
    .filter((entry) => entry.action === "keep" && !hubPaths.has(entry.path))
    .map((entry) => {
      const slug = entry.path.replace(/^\/|\/$/g, "");
      if (existing.has(slug)) return null;
      const destination = (entry.hub && HUB_PATHS[entry.hub]) || "/";
      return { source: `/${slug}`, destination, permanent: true };
    })
    .filter((r): r is Redirect => r !== null);
}
