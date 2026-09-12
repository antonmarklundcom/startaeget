import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Annonslank } from "./Annonslank";
import { PartnerCta } from "./PartnerCta";
import { Callout, Checklist, Stat, StatRow, Verifiera } from "./mdx/blocks";
import { headingId } from "./mdx/headings";

/**
 * The only MDX renderer on the site. Lane 2 may use exactly the components
 * registered here; anything else is a build error, which is the point.
 */

function toText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export const mdxComponents = {
  Annonslank,
  PartnerCta,
  Callout,
  Checklist,
  Stat,
  StatRow,
  Verifiera,
  /* The id comes from the same function the table of contents uses, so a
     heading and its TOC link can never point at different anchors. */
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 {...props} id={headingId(toText(props.children))} />
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      }}
    />
  );
}
