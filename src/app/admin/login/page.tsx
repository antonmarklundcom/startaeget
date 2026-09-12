import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasSession } from "@/lib/admin/session";
import { LoginForm } from "../_components/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Logga in", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await hasSession()) redirect("/admin/");
  const { next } = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);

  return (
    <main className="adm-login">
      <h1>Admin</h1>
      <p className="adm-muted">Redigera guider och skriv bloggposter. En inloggning, inget konto.</p>
      <LoginForm next={next && next.startsWith("/admin") ? next : "/admin/"} />
      {configured ? null : (
        <p className="adm-note">
          <strong>ADMIN_PASSWORD</strong> och <strong>ADMIN_SESSION_SECRET</strong> är inte satta i
          den här miljön. Lägg in dem i hPanel (plan §7 punkt 10) — utan dem går det inte att logga
          in.
        </p>
      )}
    </main>
  );
}
