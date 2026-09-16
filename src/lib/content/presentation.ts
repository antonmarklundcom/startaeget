import { getPartner } from "../affiliates";
import { getComparison, type Article } from "./index";
import type { Comparison } from "./schema";

export function comparisonHasAds(comparison?: Comparison | null): boolean {
  return comparison?.rows.some(
    (row) => row.partnerId && getPartner(row.partnerId)?.disclosure === "Annonslänk",
  ) ?? false;
}

/** Resolve the same comparison files used by the individual article pages. */
export async function getAdvertisedComparisonSlugs(articles: readonly Article[]): Promise<Set<string>> {
  const slugs = await Promise.all(
    articles.filter((article) => article.frontmatter.type === "comparison").map(async (article) => {
      const slug = article.frontmatter.slug;
      return comparisonHasAds(await getComparison(slug)) ? slug : null;
    }),
  );
  return new Set(slugs.filter((slug): slug is string => slug !== null));
}

/** Count labels follow the room's actual content, including post-only rooms. */
export function articleCountNoun(articles: readonly Article[], isComparisons = false): string {
  const one = articles.length === 1;
  if (isComparisons) return one ? "jämförelse" : "jämförelser";
  // "inlägg" is a neuter noun: same in the singular and the plural.
  if (articles.length && articles.every((article) => article.frontmatter.type === "post")) {
    return "inlägg";
  }
  return one ? "guide" : "guider";
}
