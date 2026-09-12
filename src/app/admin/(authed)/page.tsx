import Link from "next/link";
import { getStore, storeMode } from "@/lib/admin/store";
import { deployedBlobs } from "@/lib/admin/deployed";
import { HUBS } from "@/lib/content/schema";
import { getHub } from "@/lib/content/site";

/**
 * The list: every article the store can see, newest first, filterable by hub and
 * searchable by title or slug. Filter and search are query parameters, so the
 * screen needs no client state at all.
 */

export const dynamic = "force-dynamic";

type Search = { hub?: string; q?: string; borttagen?: string; fel?: string };

export default async function AdminListPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { hub = "", q = "", borttagen, fel } = await searchParams;
  const store = getStore();
  const [articles, deployed] = await Promise.all([store.listArticles(), deployedBlobs()]);

  const needle = q.trim().toLowerCase();
  const visible = articles.filter((article) => {
    if (hub && article.hub !== hub) return false;
    if (!needle) return true;
    return (
      article.title.toLowerCase().includes(needle) || article.slug.toLowerCase().includes(needle)
    );
  });

  const counts = new Map<string, number>();
  for (const article of articles) counts.set(article.hub, (counts.get(article.hub) ?? 0) + 1);

  return (
    <>
      <div className="adm-head">
        <h1>Artiklar</h1>
        <Link className="adm-btn adm-btn--primary" href="/admin/ny/">
          Ny bloggpost
        </Link>
      </div>

      {borttagen ? <p className="adm-chip adm-chip--ok">Filen är borttagen.</p> : null}
      {fel ? (
        <p className="adm-chip adm-chip--error">Det gick inte att ta bort filen. Försök igen.</p>
      ) : null}

      <form className="adm-filter" action="/admin/">
        <label className="adm-filter__search">
          <span>Sök</span>
          <input name="q" type="search" defaultValue={q} placeholder="titel eller adress" />
        </label>
        <label>
          <span>Hub</span>
          <select name="hub" defaultValue={hub}>
            <option value="">Alla ({articles.length})</option>
            {HUBS.map((id) => (
              <option key={id} value={id}>
                {getHub(id)?.title ?? id} ({counts.get(id) ?? 0})
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="adm-btn">
          Filtrera
        </button>
      </form>

      <p className="adm-muted">
        {visible.length} av {articles.length} artiklar ·{" "}
        {storeMode() === "github"
          ? "läst från GitHub-grenen, inte från det byggda sajten"
          : "läst från content/ på disk"}
      </p>

      <table className="adm-table">
        <thead>
          <tr>
            <th scope="col">Titel</th>
            <th scope="col">Hub</th>
            <th scope="col">Typ</th>
            <th scope="col">Uppdaterad</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((article) => {
            const deployedSha = deployed?.get(article.file);
            const waiting = Boolean(
              deployed && article.sha && deployedSha && deployedSha !== article.sha,
            );
            return (
              <tr key={article.file}>
                <td>
                  <Link href={`/admin/artiklar/${article.hub}/${article.slug}/`}>
                    {article.title}
                  </Link>
                  <span className="adm-muted adm-block">/{article.slug}/</span>
                </td>
                <td>{getHub(article.hub)?.title ?? article.hub}</td>
                <td>{article.type}</td>
                <td>{article.updated}</td>
                <td>
                  {article.draft ? (
                    <span className="adm-chip">utkast</span>
                  ) : !deployed ? (
                    /* No NEXT_PUBLIC_BUILD_SHA to compare against, so whether this
                       file is live is not something we know (plan §5.5). */
                    <span className="adm-muted" title="Bygg-status okänd: NEXT_PUBLIC_BUILD_SHA är inte satt">
                      —
                    </span>
                  ) : waiting ? (
                    <span className="adm-chip adm-chip--waiting">väntar på bygge</span>
                  ) : (
                    <span className="adm-chip adm-chip--ok">publicerad</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {visible.length === 0 ? (
        <p className="adm-note">Inga artiklar matchar filtret.</p>
      ) : null}
    </>
  );
}
