import type { Metadata } from "next";
import { SITE_NAME, SITE_LOCALE, absoluteUrl, siteUrl } from "./site";

/**
 * Every page's metadata comes from here so the length limits (title ≤ 60,
 * description ≤ 155) and the trailing-slash canonical are enforced in one place.
 */

export type MetaInput = {
  title: string;
  description: string;
  /** Site-relative path with a leading slash, e.g. "/starta-aktiebolag/". */
  path: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

function clamp(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function buildMetadata(input: MetaInput): Metadata {
  const title = clamp(input.title, 60);
  const description = clamp(input.description, 155);
  const canonical = absoluteUrl(input.path);
  const ogImage = `${siteUrl()}/og/?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: input.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.type ?? "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: canonical,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
