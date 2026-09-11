/**
 * Heading ids for the in-page table of contents.
 *
 * The TOC is built from the raw MDX text and the rendered h2 gets its id from
 * the same function, so the two can never drift. Swedish letters are folded to
 * ASCII, which keeps every anchor copy-pasteable.
 */

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type TocEntry = { id: string; text: string };

/** The `## ` headings of an MDX body, in order, skipping fenced code blocks. */
export function extractToc(body: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const used = new Set<string>();
  let inFence = false;

  for (const line of body.split("\n")) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const text = match[1].replace(/[*_`]/g, "").trim();
    let id = headingId(text);
    if (!id) continue;
    let n = 2;
    while (used.has(id)) id = `${headingId(text)}-${n++}`;
    used.add(id);
    entries.push({ id, text });
  }

  return entries;
}
