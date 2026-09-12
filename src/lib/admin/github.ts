/**
 * The GitHub Contents API over plain `fetch` — no Octokit (plan §5.5). Nothing
 * in here knows about articles or frontmatter: it moves files in and out of a
 * branch, and it is the only place a GitHub URL is written.
 *
 * Reads are cached for 60 s, which is what keeps the list screen from spending a
 * request per article on every render.
 */

export type GithubConfig = { token: string; repo: string; branch: string };

export function githubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH?.trim() || "main" };
}

export type GithubFile = { contents: string; sha: string };
export type GithubEntry = { name: string; path: string; type: string };
export type WriteOutcome =
  | { ok: true; commit?: string; sha?: string }
  | { ok: false; error: string };

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; value: unknown }>();

function cached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.at > CACHE_TTL_MS) return null;
  return entry.value as T;
}

export function clearGithubCache(): void {
  cache.clear();
}

export class GithubApi {
  constructor(private config: GithubConfig) {}

  get repo(): string {
    return this.config.repo;
  }

  get branch(): string {
    return this.config.branch;
  }

  private request(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "startaegetforetag-admin",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      cache: "no-store",
    });
  }

  private contentsPath(file: string): string {
    return `/repos/${this.config.repo}/contents/${file}?ref=${encodeURIComponent(this.config.branch)}`;
  }

  private key(kind: string, file: string): string {
    return `${kind}:${this.config.repo}:${this.config.branch}:${file}`;
  }

  async listDir(dir: string): Promise<GithubEntry[]> {
    const key = this.key("dir", dir);
    const hit = cached<GithubEntry[]>(key);
    if (hit) return hit;
    const response = await this.request(this.contentsPath(dir));
    if (!response.ok) return [];
    const body = (await response.json()) as GithubEntry[];
    const value = Array.isArray(body) ? body : [];
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  async readFile(file: string): Promise<GithubFile | null> {
    const key = this.key("file", file);
    const hit = cached<GithubFile>(key);
    if (hit) return hit;
    const response = await this.request(this.contentsPath(file));
    if (!response.ok) return null;
    const body = (await response.json()) as { content?: string; sha?: string };
    if (!body.content || !body.sha) return null;
    const value: GithubFile = {
      contents: Buffer.from(body.content, "base64").toString("utf8"),
      sha: body.sha,
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  /** PUT with the file's sha: GitHub refuses a stale one, which is the lock we want. */
  async putFile(file: string, contents: string, message: string, sha?: string): Promise<WriteOutcome> {
    const response = await this.request(`/repos/${this.config.repo}/contents/${file}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: Buffer.from(contents, "utf8").toString("base64"),
        branch: this.config.branch,
        ...(sha ? { sha } : {}),
      }),
    });
    return this.outcome(response);
  }

  async deleteFile(file: string, message: string, sha: string): Promise<WriteOutcome> {
    const response = await this.request(`/repos/${this.config.repo}/contents/${file}`, {
      method: "DELETE",
      body: JSON.stringify({ message, sha, branch: this.config.branch }),
    });
    return this.outcome(response);
  }

  /** path → blob sha for one commit, used to tell a saved file from a live one. */
  async treeBlobs(commit: string): Promise<Map<string, string> | null> {
    const key = this.key("tree", commit);
    const hit = cached<Map<string, string>>(key);
    if (hit) return hit;
    const response = await this.request(
      `/repos/${this.config.repo}/git/trees/${encodeURIComponent(commit)}?recursive=1`,
    );
    if (!response.ok) return null;
    const body = (await response.json()) as { tree?: { path: string; sha: string }[] };
    const value = new Map<string, string>();
    for (const entry of body.tree ?? []) value.set(entry.path, entry.sha);
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  private async outcome(response: Response): Promise<WriteOutcome> {
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let detail = text.slice(0, 300);
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) detail = parsed.message;
      } catch {
        /* the body was not JSON; the raw text is the best we have */
      }
      return { ok: false, error: `GitHub svarade ${response.status}: ${detail}` };
    }
    const body = (await response.json().catch(() => ({}))) as {
      commit?: { sha?: string };
      content?: { sha?: string };
    };
    clearGithubCache();
    // The file's *new* blob sha: the editor keeps it so a second save in the
    // same page does not arrive with the sha it loaded and get a 409.
    return { ok: true, commit: body.commit?.sha?.slice(0, 7), sha: body.content?.sha };
  }
}

export function githubApi(): GithubApi | null {
  const config = githubConfig();
  return config ? new GithubApi(config) : null;
}
