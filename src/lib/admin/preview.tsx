import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/Mdx";

/**
 * The preview pane (plan §5.5): the body is compiled with the site's own MDX
 * component vocabulary, so what the admin sees is what the article template will
 * render — including the compile error, which is the more useful half.
 *
 * The compiled tree is returned as a server-rendered node, not as an HTML
 * string: Next refuses `react-dom/server` inside a server action ("render or
 * return the content directly as a Server Component instead"), and this way the
 * preview needs no `dangerouslySetInnerHTML` either.
 */

export type PreviewResult =
  | { ok: true; node: React.ReactNode }
  | { ok: false; error: string };

export async function renderPreview(body: string): Promise<PreviewResult> {
  if (!body.trim()) return { ok: false, error: "Texten är tom — inget att förhandsgranska." };
  try {
    const { content } = await compileMDX({
      source: body,
      components: mdxComponents,
      options: { mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
    });
    return { ok: true, node: content };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
