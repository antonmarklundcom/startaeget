import { describe, expect, it } from "vitest";
import { duplicateHeadings, extractToc, headingId } from "../src/components/mdx/headings";

/**
 * The table of contents and the rendered `h2` must agree on every anchor, which
 * is only true while heading texts are unique — see `duplicateHeadings`.
 */
describe("heading anchors", () => {
  it("folds Swedish letters to ASCII", () => {
    expect(headingId("Så mycket kostar det")).toBe("sa-mycket-kostar-det");
  });

  it("skips headings inside fenced code blocks", () => {
    expect(extractToc("## Riktig\n\n```\n## Inte en rubrik\n```\n")).toEqual([
      { id: "riktig", text: "Riktig" },
    ]);
  });

  it("gives every TOC entry an id the renderer also produces", () => {
    const body = "## Steg för steg\n\n## Kostnader\n";
    for (const entry of extractToc(body)) {
      expect(entry.id).toBe(headingId(entry.text));
    }
  });

  it("reports a repeated heading, which the renderer cannot disambiguate", () => {
    expect(duplicateHeadings("## Steg för steg\n\n## Steg för steg\n")).toEqual([
      "Steg för steg",
    ]);
    expect(duplicateHeadings("## Steg för steg\n\n## Kostnader\n")).toEqual([]);
  });
});
