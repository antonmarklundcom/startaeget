import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { articleFrontmatterSchema, type ArticleFrontmatter, type Hub } from "@/lib/content/schema";
import { toFileContents, validateArticle, type ValidationResult } from "./validate";

/**
 * The only module in the admin that knows whether an article lives on disk or in
 * GitHub (plan §5.5). Screens call the store; the store picks its backend from
 * the environment and runs every write through the validation gate first, so
 * neither backend can skip it and an invalid file is never written anywhere.
 */

export type StoreMode = "local" | "github";

export type ArticleSummary = {
  hub: string;
  slug: string;
  title: string;
  type: string;
  updated: string;
  draft: boolean;
  /** Path relative to the repository root. */
  file: string;
  /** GitHub blob sha; only the github backend has one. */
  sha?: string;
};

export type StoredArticle = ArticleSummary & {
  frontmatter: ArticleFrontmatter;
  body: string;
};

export type WriteInput = {
  hub: string;
  slug: string;
  frontmatter: unknown;
  body: string;
  /** The slug the file had before this save, when it is an edit. */
  existingSlug?: string;
  /** The sha the editor loaded, so github mode refuses a lost-update write. */
  sha?: string;
};

export type WriteResult = {
  ok: boolean;
  validation: ValidationResult;
  mode: StoreMode;
  /** Short commit sha, github mode only. */
  commit?: string;
  /** What went wrong outside validation (a GitHub 409, a disk error). */
  error?: string;
  slug?: string;
  hub?: string;
};

export interface AdminStore {
  readonly mode: StoreMode;
  listArticles(): Promise<ArticleSummary[]>;
  readArticle(hub: string, slug: string): Promise<StoredArticle | null>;
  writeArticle(input: WriteInput): Promise<WriteResult>;
  createArticle(input: WriteInput): Promise<WriteResult>;
  deleteArticle(hub: string, slug: string, sha?: string): Promise<WriteResult>;
}

export const ARTICLES_PREFIX = "content/articles";

export function articlePath(hub: string, slug: string): string {
  return `${ARTICLES_PREFIX}/${hub}/${slug}.mdx`;
}

/** A store write never trusts a path built from form input. */
function safeSegment(value: string): string | null {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : null;
}

function summarise(file: string, frontmatter: ArticleFrontmatter, sha?: string): ArticleSummary {
  return {
    hub: frontmatter.hub,
    slug: frontmatter.slug,
    title: frontmatter.title,
    type: frontmatter.type,
    updated: frontmatter.updated,
    draft: frontmatter.draft,
    file,
    sha,
  };
}

function parseFile(file: string, raw: string, sha?: string): StoredArticle | null {
  const { data, content } = matter(raw);
  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) return null;
  return { ...summarise(file, parsed.data, sha), frontmatter: parsed.data, body: content.trim() };
}

/** The shared write path: validate, then hand the bytes to the backend. */
async function guardedWrite(
  store: AdminStore,
  input: WriteInput,
  taken: Map<string, string>,
  put: (file: string, contents: string, frontmatter: ArticleFrontmatter) => Promise<WriteResult>,
): Promise<WriteResult> {
  const hub = safeSegment(input.hub);
  const slug = safeSegment(input.slug);
  if (!hub || !slug) {
    return {
      ok: false,
      mode: store.mode,
      validation: {
        ok: false,
        errors: ["Hub och adress måste vara små bokstäver, siffror och bindestreck."],
        warnings: [],
      },
    };
  }

  const validation = await validateArticle({
    frontmatter: input.frontmatter,
    body: input.body,
    existingSlug: input.existingSlug,
    takenSlugs: taken,
  });
  if (!validation.ok || !validation.frontmatter) {
    return { ok: false, mode: store.mode, validation };
  }
  if (validation.frontmatter.slug !== slug || validation.frontmatter.hub !== hub) {
    return {
      ok: false,
      mode: store.mode,
      validation: {
        ...validation,
        ok: false,
        errors: [
          ...validation.errors,
          "Adressen och hubben i formuläret måste stämma med filens frontmatter.",
        ],
      },
    };
  }

  const contents = toFileContents(validation.frontmatter, input.body);
  const result = await put(articlePath(hub, slug), contents, validation.frontmatter);
  return { ...result, validation, slug, hub };
}

// --- local ------------------------------------------------------------------

/**
 * The repo's own `content/` on disk: what `npm run dev` edits, and the fallback
 * in production when no GitHub token is configured (plan §5.5). A write here is
 * only durable on the machine it ran on, which the UI says out loud.
 */
class LocalStore implements AdminStore {
  readonly mode = "local" as const;

  private root = process.cwd();

  private async taken(): Promise<Map<string, string>> {
    const taken = new Map<string, string>();
    for (const item of await this.listArticles()) taken.set(item.slug, item.file);
    const pagesDirs = ["content/pages", "content/lead-magnets"];
    for (const dir of pagesDirs) {
      for (const file of await this.mdxFiles(dir)) {
        const raw = await fs.readFile(path.join(this.root, file), "utf8");
        const slug = matter(raw).data?.slug;
        if (typeof slug === "string") taken.set(slug, file);
      }
    }
    return taken;
  }

  private async mdxFiles(dir: string): Promise<string[]> {
    const absolute = path.join(this.root, dir);
    let entries;
    try {
      entries = await fs.readdir(absolute, { withFileTypes: true });
    } catch {
      return [];
    }
    const out: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) out.push(...(await this.mdxFiles(`${dir}/${entry.name}`)));
      else if (entry.name.endsWith(".mdx")) out.push(`${dir}/${entry.name}`);
    }
    return out.sort();
  }

  async listArticles(): Promise<ArticleSummary[]> {
    const files = await this.mdxFiles(ARTICLES_PREFIX);
    const out: ArticleSummary[] = [];
    for (const file of files) {
      if (path.basename(file).startsWith("_")) continue;
      const raw = await fs.readFile(path.join(this.root, file), "utf8");
      const article = parseFile(file, raw);
      if (article) out.push(summarise(file, article.frontmatter));
    }
    return sortArticles(out);
  }

  async readArticle(hub: string, slug: string): Promise<StoredArticle | null> {
    if (!safeSegment(hub) || !safeSegment(slug)) return null;
    const file = articlePath(hub, slug);
    try {
      const raw = await fs.readFile(path.join(this.root, file), "utf8");
      return parseFile(file, raw);
    } catch {
      return null;
    }
  }

  async writeArticle(input: WriteInput): Promise<WriteResult> {
    return guardedWrite(this, input, await this.taken(), async (file, contents) => {
      const absolute = path.join(this.root, file);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, contents, "utf8");
      return { ok: true, mode: this.mode, validation: { ok: true, errors: [], warnings: [] } };
    });
  }

  async createArticle(input: WriteInput): Promise<WriteResult> {
    const existing = await this.readArticle(input.hub, input.slug);
    if (existing) {
      return {
        ok: false,
        mode: this.mode,
        validation: {
          ok: false,
          errors: [`${articlePath(input.hub, input.slug)} finns redan.`],
          warnings: [],
        },
      };
    }
    return this.writeArticle(input);
  }

  async deleteArticle(hub: string, slug: string): Promise<WriteResult> {
    const empty: ValidationResult = { ok: true, errors: [], warnings: [] };
    if (!safeSegment(hub) || !safeSegment(slug)) {
      return { ok: false, mode: this.mode, validation: { ...empty, ok: false, errors: ["Ogiltig adress."] } };
    }
    try {
      await fs.unlink(path.join(this.root, articlePath(hub, slug)));
      return { ok: true, mode: this.mode, validation: empty, slug, hub };
    } catch (error) {
      return {
        ok: false,
        mode: this.mode,
        validation: empty,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// --- github -----------------------------------------------------------------

type GithubConfig = { token: string; repo: string; branch: string };

export function githubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH?.trim() || "main" };
}

type CacheEntry = { at: number; value: unknown };
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

function cached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.at > CACHE_TTL_MS) return null;
  return entry.value as T;
}

function putCache(key: string, value: unknown): void {
  cache.set(key, { at: Date.now(), value });
}

export function clearStoreCache(): void {
  cache.clear();
}

/**
 * The GitHub Contents API over plain `fetch` — no Octokit (plan §5.5). Reads
 * come from the branch, not from the deployed build, so an edit that is
 * committed but not yet rebuilt is what the editor shows.
 */
class GithubStore implements AdminStore {
  readonly mode = "github" as const;

  constructor(private config: GithubConfig) {}

  private async api(url: string, init?: RequestInit): Promise<Response> {
    return fetch(`https://api.github.com${url}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "startaegetforetag-admin",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  }

  private contentsUrl(file: string): string {
    return `/repos/${this.config.repo}/contents/${file}?ref=${encodeURIComponent(this.config.branch)}`;
  }

  private async listDir(dir: string): Promise<{ name: string; path: string; type: string }[]> {
    const response = await this.api(this.contentsUrl(dir));
    if (!response.ok) return [];
    const body = (await response.json()) as { name: string; path: string; type: string }[];
    return Array.isArray(body) ? body : [];
  }

  async listArticles(): Promise<ArticleSummary[]> {
    const key = `list:${this.config.repo}:${this.config.branch}`;
    const hit = cached<ArticleSummary[]>(key);
    if (hit) return hit;

    const out: ArticleSummary[] = [];
    for (const hubDir of await this.listDir(ARTICLES_PREFIX)) {
      if (hubDir.type !== "dir") continue;
      for (const entry of await this.listDir(hubDir.path)) {
        if (entry.type !== "file" || !entry.name.endsWith(".mdx")) continue;
        if (entry.name.startsWith("_")) continue;
        const file = await this.readFile(entry.path);
        if (!file) continue;
        const article = parseFile(entry.path, file.contents, file.sha);
        if (article) out.push(summarise(entry.path, article.frontmatter, file.sha));
      }
    }
    const sorted = sortArticles(out);
    putCache(key, sorted);
    return sorted;
  }

  private async readFile(file: string): Promise<{ contents: string; sha: string } | null> {
    const key = `file:${this.config.repo}:${this.config.branch}:${file}`;
    const hit = cached<{ contents: string; sha: string }>(key);
    if (hit) return hit;

    const response = await this.api(this.contentsUrl(file));
    if (!response.ok) return null;
    const body = (await response.json()) as { content?: string; sha?: string; encoding?: string };
    if (!body.content || !body.sha) return null;
    const contents = Buffer.from(body.content, "base64").toString("utf8");
    const value = { contents, sha: body.sha };
    putCache(key, value);
    return value;
  }

  async readArticle(hub: string, slug: string): Promise<StoredArticle | null> {
    if (!safeSegment(hub) || !safeSegment(slug)) return null;
    const file = articlePath(hub, slug);
    const found = await this.readFile(file);
    if (!found) return null;
    return parseFile(file, found.contents, found.sha);
  }

  private async taken(): Promise<Map<string, string>> {
    const taken = new Map<string, string>();
    for (const item of await this.listArticles()) taken.set(item.slug, item.file);
    for (const dir of ["content/pages", "content/lead-magnets"]) {
      for (const entry of await this.listDir(dir)) {
        if (entry.type !== "file" || !entry.name.endsWith(".mdx")) continue;
        const file = await this.readFile(entry.path);
        const slug = file ? matter(file.contents).data?.slug : null;
        if (typeof slug === "string") taken.set(slug, entry.path);
      }
    }
    return taken;
  }

  async writeArticle(input: WriteInput): Promise<WriteResult> {
    return guardedWrite(this, input, await this.taken(), async (file, contents, frontmatter) => {
      // The sha the editor loaded, or the current one: GitHub refuses a PUT with
      // a stale sha, which is exactly the lost-update protection we want.
      const sha = input.sha ?? (await this.readFile(file))?.sha;
      const response = await this.api(`/repos/${this.config.repo}/contents/${file}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `admin: ${frontmatter.title}`,
          content: Buffer.from(contents, "utf8").toString("base64"),
          branch: this.config.branch,
          ...(sha ? { sha } : {}),
        }),
      });
      const empty: ValidationResult = { ok: true, errors: [], warnings: [] };
      if (!response.ok) {
        return { ok: false, mode: this.mode, validation: empty, error: await githubError(response) };
      }
      const body = (await response.json()) as { commit?: { sha?: string } };
      clearStoreCache();
      return {
        ok: true,
        mode: this.mode,
        validation: empty,
        commit: body.commit?.sha?.slice(0, 7),
      };
    });
  }

  async createArticle(input: WriteInput): Promise<WriteResult> {
    const existing = await this.readArticle(input.hub, input.slug);
    if (existing) {
      return {
        ok: false,
        mode: this.mode,
        validation: {
          ok: false,
          errors: [`${articlePath(input.hub, input.slug)} finns redan i ${this.config.repo}.`],
          warnings: [],
        },
      };
    }
    return this.writeArticle({ ...input, sha: undefined });
  }

  async deleteArticle(hub: string, slug: string, sha?: string): Promise<WriteResult> {
    const empty: ValidationResult = { ok: true, errors: [], warnings: [] };
    if (!safeSegment(hub) || !safeSegment(slug)) {
      return { ok: false, mode: this.mode, validation: { ...empty, ok: false, errors: ["Ogiltig adress."] } };
    }
    const file = articlePath(hub, slug);
    const blob = sha ?? (await this.readFile(file))?.sha;
    if (!blob) {
      return { ok: false, mode: this.mode, validation: empty, error: `${file} finns inte.` };
    }
    const response = await this.api(`/repos/${this.config.repo}/contents/${file}`, {
      method: "DELETE",
      body: JSON.stringify({
        message: `admin: ta bort ${slug}`,
        sha: blob,
        branch: this.config.branch,
      }),
    });
    if (!response.ok) {
      return { ok: false, mode: this.mode, validation: empty, error: await githubError(response) };
    }
    const body = (await response.json()) as { commit?: { sha?: string } };
    clearStoreCache();
    return {
      ok: true,
      mode: this.mode,
      validation: empty,
      commit: body.commit?.sha?.slice(0, 7),
      slug,
      hub,
    };
  }
}

async function githubError(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  let detail = text.slice(0, 300);
  try {
    const parsed = JSON.parse(text) as { message?: string };
    if (parsed.message) detail = parsed.message;
  } catch {
    /* the body was not JSON; the raw text is the best we have */
  }
  return `GitHub svarade ${response.status}: ${detail}`;
}

function sortArticles(items: ArticleSummary[]): ArticleSummary[] {
  return [...items].sort(
    (a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug),
  );
}

/**
 * `github` when a token and a repo are configured, `local` otherwise. A missing
 * token is never a stop (plan §4.5): the admin still runs, and says where it saved.
 */
export function getStore(): AdminStore {
  const config = githubConfig();
  return config ? new GithubStore(config) : new LocalStore();
}

export function storeMode(): StoreMode {
  return githubConfig() ? "github" : "local";
}

export type { Hub };
