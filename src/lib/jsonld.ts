import { SITE_NAME, absoluteUrl, siteUrl } from "./site";
import type { ArticleFrontmatter } from "./content/schema";

/**
 * JSON-LD builders (plan §5.1). Pages render the returned object through
 * <JsonLd>; nothing hand-writes schema.org markup.
 */

type Json = Record<string, unknown>;

export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${siteUrl()}/`,
    description:
      "Guider, jämförelser och verktyg för dig som startar företag i Sverige.",
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${siteUrl()}/`,
    inLanguage: "sv-SE",
  };
}

export function articleJsonLd(fm: ArticleFrontmatter): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.description,
    inLanguage: "sv-SE",
    dateModified: fm.updated,
    mainEntityOfPage: absoluteUrl(`/${fm.slug}/`),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    ...(fm.sources.length
      ? { citation: fm.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })) }
      : {}),
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]): Json | null {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function softwareApplicationJsonLd(tool: {
  title: string;
  description: string;
  path: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    url: absoluteUrl(tool.path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Webbläsare",
    inLanguage: "sv-SE",
    offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
  };
}
