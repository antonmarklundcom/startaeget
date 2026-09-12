"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, loginKey } from "@/lib/admin/auth";
import { createSessionToken, hasSession, sessionCookieOptions } from "@/lib/admin/session";
import { SESSION_COOKIE } from "@/lib/admin/token";
import { getStore, type WriteResult } from "@/lib/admin/store";
import { renderPreview, type PreviewResult } from "@/lib/admin/preview";

/**
 * Every admin mutation is a server action: no client-side API surface, no fetch
 * wrapper, and the forms still work with JavaScript switched off (plan §5.5 —
 * plain textarea, server actions, no editor dependency).
 */

export type LoginState = { error?: string };

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/");
  const outcome = checkPassword(password, await loginKey());

  if (outcome === "unconfigured") {
    return {
      error:
        "ADMIN_PASSWORD och ADMIN_SESSION_SECRET är inte satta i miljön — " +
        "lägg in dem i hPanel (plan §7 punkt 10) innan inloggningen fungerar.",
    };
  }
  if (outcome === "throttled") {
    return { error: "För många misslyckade försök. Vänta 15 minuter och försök igen." };
  }
  if (outcome === "wrong") return { error: "Fel lösenord." };

  const token = createSessionToken();
  if (!token) return { error: "ADMIN_SESSION_SECRET saknas eller är för kort (minst 16 tecken)." };
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect(next.startsWith("/admin") ? next : "/admin/");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete({ name: SESSION_COOKIE, path: sessionCookieOptions.path });
  redirect("/admin/login/");
}

/** Server actions are POST endpoints; each one re-checks the session itself. */
async function requireSession(): Promise<void> {
  if (!(await hasSession())) redirect("/admin/login/");
}

export type SaveState = {
  ok?: boolean;
  message?: string;
  errors?: string[];
  warnings?: string[];
};

function readFrontmatter(formData: FormData): Record<string, unknown> {
  const text = (name: string): string => String(formData.get(name) ?? "").trim();

  const sources: { label: string; url: string }[] = [];
  const faq: { q: string; a: string }[] = [];
  for (let index = 0; index < 20; index += 1) {
    const label = text(`source-label-${index}`);
    const url = text(`source-url-${index}`);
    if (label || url) sources.push({ label, url });
    const q = text(`faq-q-${index}`);
    const a = text(`faq-a-${index}`);
    if (q || a) faq.push({ q, a });
  }

  const slot = text("image-slot");
  const alt = text("image-alt");

  return {
    title: text("title"),
    slug: text("slug"),
    // Both are validated by the schema on the way in; the select only limits
    // what the form offers.
    hub: text("hub"),
    type: text("type"),
    description: text("description"),
    intent: text("intent"),
    // `updated` defaults to today on every save (plan §5.5).
    updated: text("updated") || new Date().toISOString().slice(0, 10),
    sources,
    partners: formData.getAll("partners").map(String),
    related: formData.getAll("related").map(String),
    faq,
    ...(slot || alt ? { image: { slot, alt } } : {}),
    legacy: formData.get("legacy") === "on" || formData.get("legacy") === "true",
    draft: formData.get("draft") === "on" || formData.get("draft") === "true",
  };
}

function toState(result: WriteResult, saved: string): SaveState {
  if (!result.ok) {
    return {
      ok: false,
      errors: [...result.validation.errors, ...(result.error ? [result.error] : [])],
      warnings: result.validation.warnings,
      message: "Inget sparades — rätta felen nedan först.",
    };
  }
  return {
    ok: true,
    message: saved,
    warnings: result.validation.warnings,
    errors: [],
  };
}

function savedMessage(result: WriteResult): string {
  if (result.mode === "github") {
    return result.commit
      ? `Sparat i GitHub (commit ${result.commit}). Hostinger bygger om sajten — ändringen syns om några minuter.`
      : "Sparat i GitHub. Hostinger bygger om sajten — ändringen syns om några minuter.";
  }
  return "Sparat lokalt i content/ (filen ligger i repot på den här maskinen).";
}

export async function saveArticleAction(_state: SaveState, formData: FormData): Promise<SaveState> {
  await requireSession();
  const frontmatter = readFrontmatter(formData);
  const store = getStore();
  const result = await store.writeArticle({
    hub: String(frontmatter.hub ?? ""),
    slug: String(frontmatter.slug ?? ""),
    frontmatter,
    body: String(formData.get("body") ?? ""),
    existingSlug: String(formData.get("existing-slug") ?? "") || undefined,
    sha: String(formData.get("sha") ?? "") || undefined,
  });
  if (result.ok) revalidatePath("/admin");
  return toState(result, savedMessage(result));
}

export async function createArticleAction(
  _state: SaveState,
  formData: FormData,
): Promise<SaveState> {
  await requireSession();
  const frontmatter = readFrontmatter(formData);
  const store = getStore();
  const result = await store.createArticle({
    hub: String(frontmatter.hub ?? ""),
    slug: String(frontmatter.slug ?? ""),
    frontmatter,
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) return toState(result, "");
  revalidatePath("/admin");
  redirect(`/admin/artiklar/${result.hub}/${result.slug}/?ny=1`);
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireSession();
  const hub = String(formData.get("hub") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const sha = String(formData.get("sha") ?? "") || undefined;
  const result = await getStore().deleteArticle(hub, slug, sha);
  revalidatePath("/admin");
  redirect(result.ok ? "/admin/?borttagen=1" : "/admin/?fel=1");
}

export async function previewAction(_state: PreviewResult | null, formData: FormData) {
  await requireSession();
  return renderPreview(String(formData.get("body") ?? ""));
}
