/** Site-level constants. Everything environment-dependent goes through here. */

export const SITE_NAME = "Starta Eget Företag";
export const SITE_LOCALE = "sv_SE";
export const SITE_TAGLINE = "Rätt val från första dagen";

export function siteUrl(): string {
  const raw = process.env.SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Absolute URL for a site-relative path, always with a trailing slash. */
export function absoluteUrl(pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withSlash = clean.endsWith("/") || clean.includes(".") ? clean : `${clean}/`;
  return `${siteUrl()}${withSlash}`;
}

export function formatUpdated(iso: string): string {
  const [year, month] = iso.split("-");
  const months = [
    "januari", "februari", "mars", "april", "maj", "juni",
    "juli", "augusti", "september", "oktober", "november", "december",
  ];
  const name = months[Number(month) - 1] ?? month;
  return `${name} ${year}`;
}
