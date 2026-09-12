import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore, storeMode } from "@/lib/admin/store";
import { editorOptions } from "@/lib/admin/options";
import { ArticleEditor } from "@/app/admin/_components/ArticleEditor";
import { deleteArticleAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ hub: string; slug: string }>;
  searchParams: Promise<{ ny?: string }>;
}) {
  const { hub, slug } = await params;
  const { ny } = await searchParams;
  const article = await getStore().readArticle(hub, slug);
  if (!article) notFound();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>{article.frontmatter.title}</h1>
          <p className="adm-muted">
            {article.file}
            {article.sha ? ` · blob ${article.sha.slice(0, 7)}` : ""} ·{" "}
            {storeMode() === "github" ? "GitHub" : "disk"}
          </p>
        </div>
        <p className="adm-head__actions">
          <Link className="adm-btn" href={`/${article.frontmatter.slug}/`} prefetch={false}>
            Visa sidan ↗
          </Link>
          <Link className="adm-btn adm-btn--quiet" href="/admin/">
            Tillbaka
          </Link>
        </p>
      </div>

      <ArticleEditor
        mode="edit"
        justCreated={ny === "1"}
        options={editorOptions()}
        article={{
          hub: article.frontmatter.hub,
          slug: article.frontmatter.slug,
          title: article.frontmatter.title,
          type: article.frontmatter.type,
          description: article.frontmatter.description,
          intent: article.frontmatter.intent,
          updated: article.frontmatter.updated,
          sources: article.frontmatter.sources,
          partners: article.frontmatter.partners,
          related: article.frontmatter.related,
          faq: article.frontmatter.faq,
          image: article.frontmatter.image,
          legacy: article.frontmatter.legacy,
          draft: article.frontmatter.draft,
          body: article.body,
          sha: article.sha,
        }}
      />

      <form className="adm-danger" action={deleteArticleAction}>
        <input type="hidden" name="hub" value={article.frontmatter.hub} />
        <input type="hidden" name="slug" value={article.frontmatter.slug} />
        {article.sha ? <input type="hidden" name="sha" value={article.sha} /> : null}
        <button type="submit" className="adm-btn adm-btn--danger" data-testid="delete">
          Ta bort filen
        </button>
        <span className="adm-muted">
          Tar bort {article.file}
          {storeMode() === "github" ? " med en commit på grenen" : " från disken"}. Går att ångra i
          Git, men inte här.
        </span>
      </form>
    </>
  );
}
