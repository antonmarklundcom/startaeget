import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Annonslank } from "./Annonslank";
import { PartnerCta } from "./PartnerCta";

/**
 * The only MDX renderer on the site. Lane 2 may use exactly the components
 * registered here; anything else is a build error, which is the point.
 */
export const mdxComponents = {
  Annonslank,
  PartnerCta,
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
