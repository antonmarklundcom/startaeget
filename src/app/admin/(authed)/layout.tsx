import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSession } from "@/lib/admin/session";
import { storeMode } from "@/lib/admin/store";
import { buildSha } from "@/lib/admin/deployed";
import { logoutAction } from "../actions";

/**
 * Everything inside this group needs a session. `src/middleware.ts` already
 * bounced the request once; this is the check that runs in Node, with
 * `crypto.timingSafeEqual`, before any content is read.
 */

export const dynamic = "force-dynamic";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasSession())) redirect("/admin/login/");
  const mode = storeMode();
  const sha = buildSha();

  return (
    <>
      <header className="adm-bar">
        <Link href="/admin/" className="adm-bar__brand">
          Admin
        </Link>
        <nav className="adm-bar__nav">
          <Link href="/admin/">Artiklar</Link>
          <Link href="/admin/ny/">Ny bloggpost</Link>
          <Link href="/" prefetch={false}>
            Visa sajten ↗
          </Link>
        </nav>
        <span className="adm-bar__meta">
          {mode === "github" ? "sparar till GitHub" : "sparar lokalt"}
          {sha ? ` · bygge ${sha.slice(0, 7)}` : ""}
        </span>
        <form action={logoutAction}>
          <button type="submit" className="adm-btn adm-btn--quiet">
            Logga ut
          </button>
        </form>
      </header>
      <main className="adm-main">{children}</main>
    </>
  );
}
