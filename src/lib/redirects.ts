import legacy from "../../content/legacy-urls.json";

export type LegacyAction = "keep" | "redirect" | "retire";

export type LegacyEntry = {
  path: string;
  action: LegacyAction;
  to?: string;
  hub?: string;
  type?: string;
};

export type LegacyFile = {
  complete: boolean;
  note?: string;
  entries: LegacyEntry[];
  todo_unknown_slugs?: string[];
};

export const legacyFile = legacy as LegacyFile;
export const legacyEntries: LegacyEntry[] = legacyFile.entries;

/** Hub paths that every retired legacy post may fall back to (§2.1). */
export const HUB_PATHS: Record<string, string> = {
  "starta-foretag": "/starta-foretag/",
  ekonomi: "/ekonomi/",
  affarside: "/affarside/",
  "e-handel": "/e-handel/",
  hemsida: "/hemsida/",
  marknadsforing: "/marknadsforing/",
};

/**
 * Every legacy path that must answer 200 (action `keep`). The verify script
 * asserts each of these resolves; the rest must answer 301.
 */
export function legacyKeepPaths(): string[] {
  return legacyEntries.filter((e) => e.action === "keep").map((e) => e.path);
}

function targetFor(entry: LegacyEntry): string | null {
  if (entry.action === "keep") return null;
  if (entry.to) return entry.to;
  if (entry.hub && HUB_PATHS[entry.hub]) return HUB_PATHS[entry.hub];
  return "/";
}

/** WordPress plumbing paths that never had content worth keeping. */
const WORDPRESS_NOISE = [
  { source: "/feed", destination: "/" },
  { source: "/comments/feed", destination: "/" },
  { source: "/author/:path*", destination: "/" },
  { source: "/page/:path*", destination: "/" },
  { source: "/tag/:path*", destination: "/" },
  { source: "/wp-login.php", destination: "/" },
  { source: "/wp-admin/:path*", destination: "/" },
];

export type Redirect = { source: string; destination: string; permanent: boolean };

export function legacyRedirects(): Redirect[] {
  const seen = new Set<string>();
  const out: Redirect[] = [];

  for (const entry of legacyEntries) {
    const destination = targetFor(entry);
    if (!destination) continue;
    // next.config matches without the trailing slash when trailingSlash is on.
    const source = entry.path.replace(/\/$/, "") || "/";
    if (source === "/" || seen.has(source)) continue;
    seen.add(source);
    out.push({ source, destination, permanent: true });
  }

  for (const noise of WORDPRESS_NOISE) {
    if (seen.has(noise.source)) continue;
    seen.add(noise.source);
    out.push({ ...noise, permanent: true });
  }

  return out;
}
