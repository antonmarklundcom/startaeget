import { afterEach, beforeEach, describe, expect, it } from "vitest";
import matter from "gray-matter";
import {
  toFileContents,
  validateShape,
  internalLinkWarnings,
  takenSlugsFromContent,
} from "../src/lib/admin/serialize";
import { articleFrontmatterSchema } from "../src/lib/content/schema";
import { createSessionToken, verifySessionToken } from "../src/lib/admin/session";
import { verifySessionTokenEdge } from "../src/lib/admin/session-edge";
import { SESSION_TTL_MS } from "../src/lib/admin/token";
import { checkPassword, resetFailures } from "../src/lib/admin/auth";
import { clearGithubCache, githubApi, githubConfig } from "../src/lib/admin/github";

const realFetch = globalThis.fetch;

/**
 * The admin's two load-bearing contracts (plan §5.5): a file the editor writes
 * parses back to exactly what it wrote, and a session cookie is only accepted
 * when it was signed with our own secret and has not expired.
 */

const frontmatter = articleFrontmatterSchema.parse({
  title: "Testrubrik för rundgången",
  slug: "rundgang-test",
  hub: "blogg",
  type: "post",
  description:
    "En beskrivning som är lång nog att klara schemats femtiotecken-gräns men kortare än hundrafemtiofem.",
  intent: "rundgång frontmatter",
  updated: "2026-09-12",
  sources: [{ label: "Bolagsverket", url: "https://bolagsverket.se/" }],
  partners: ["bokio"],
  related: ["starta-aktiebolag"],
  faq: [{ q: "Är detta en fråga?", a: "Ja, och det här är svaret på den." }],
  image: { slot: "rundgang-test-hero", alt: "En bild av ingenting särskilt." },
  legacy: true,
});

const body = `Kroppen måste vara minst tvåhundra tecken för att loadern ska acceptera filen,
så den här texten är skriven för att räcka till. Den innehåller en länk till
[Bolagsformsväljaren](/verktyg/bolagsform/) och en rubrik.

## En rubrik
`;

describe("frontmatter round-trip", () => {
  it("parses back to exactly what was written", () => {
    const file = toFileContents(frontmatter, body);
    const parsed = matter(file);
    expect(articleFrontmatterSchema.parse(parsed.data)).toEqual(frontmatter);
    expect(parsed.content.trim()).toBe(body.trim());
  });

  it("survives a second pass unchanged", () => {
    const once = toFileContents(frontmatter, body);
    const again = toFileContents(articleFrontmatterSchema.parse(matter(once).data), body);
    expect(again).toBe(once);
  });

  it("keeps the optional keys out of the file when they are empty", () => {
    const bare = articleFrontmatterSchema.parse({
      ...frontmatter,
      faq: [],
      image: undefined,
      draft: false,
    });
    const file = toFileContents(bare, body);
    expect(file).not.toMatch(/^faq:/m);
    expect(file).not.toMatch(/^image:/m);
    expect(file).not.toMatch(/^draft:/m);
  });
});

describe("the validation gate", () => {
  it("accepts a good post", () => {
    const result = validateShape({ frontmatter, body, existingSlug: "rundgang-test" });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("names the offending field on bad frontmatter", () => {
    const result = validateShape({ frontmatter: { ...frontmatter, description: "Kort." }, body });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/description/);
  });

  it("refuses a body shorter than the loader accepts", () => {
    const result = validateShape({ frontmatter, body: "För kort." });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/200 tecken/);
  });

  it("refuses a slug that a hub already owns", () => {
    const result = validateShape({ frontmatter: { ...frontmatter, slug: "ekonomi" }, body });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/reserverad/);
  });

  it("refuses a slug another file already claims", () => {
    const taken = takenSlugsFromContent();
    const [existing] = [...taken.keys()];
    const result = validateShape({ frontmatter: { ...frontmatter, slug: existing }, body, takenSlugs: taken });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/används redan/);
  });

  it("refuses two headings with the same wording", () => {
    const result = validateShape({
      frontmatter,
      body: `${body}\n## En rubrik\n\nMer text som gör kroppen ännu längre än tvåhundra tecken.`,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/samma text/);
  });

  it("warns about an internal link that resolves nowhere, and stays quiet about one that does", () => {
    expect(internalLinkWarnings("Se [tool](/verktyg/bolagsform/) och [hub](/ekonomi/).")).toEqual([]);
    const warnings = internalLinkWarnings("Se [ingenting](/finns-inte-alls/).");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch("/finns-inte-alls/");
  });
});

describe("sessions", () => {
  const SECRET = "enhetstest-hemlighet-0123456789";

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });

  it("accepts a token it just signed", async () => {
    const token = createSessionToken();
    expect(token).toBeTruthy();
    expect(verifySessionToken(token)).toBe(true);
    await expect(verifySessionTokenEdge(token)).resolves.toBe(true);
  });

  it("rejects a tampered signature in both runtimes", async () => {
    const token = createSessionToken() as string;
    const forged = `${token.slice(0, -4)}aaaa`;
    expect(verifySessionToken(forged)).toBe(false);
    await expect(verifySessionTokenEdge(forged)).resolves.toBe(false);
  });

  it("rejects a token signed with another secret", async () => {
    const token = createSessionToken() as string;
    process.env.ADMIN_SESSION_SECRET = "en-helt-annan-hemlighet-9876543210";
    expect(verifySessionToken(token)).toBe(false);
    await expect(verifySessionTokenEdge(token)).resolves.toBe(false);
  });

  it("rejects an expired token", async () => {
    const token = createSessionToken() as string;
    const later = Date.now() + SESSION_TTL_MS + 1_000;
    expect(verifySessionToken(token, later)).toBe(false);
    await expect(verifySessionTokenEdge(token, later)).resolves.toBe(false);
  });

  it("rejects nonsense and an empty cookie", async () => {
    for (const junk of ["", "abc", "1.2", "999999999999.nonce.signature"]) {
      expect(verifySessionToken(junk)).toBe(false);
      await expect(verifySessionTokenEdge(junk)).resolves.toBe(false);
    }
  });

  it("signs nothing without a secret", () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(createSessionToken()).toBeNull();
    expect(verifySessionToken("anything.at.all")).toBe(false);
  });
});

describe("login throttling", () => {
  beforeEach(() => {
    resetFailures();
    process.env.ADMIN_PASSWORD = "rätt-lösenord";
    process.env.ADMIN_SESSION_SECRET = "enhetstest-hemlighet-0123456789";
  });

  it("accepts the right password and refuses the wrong one", () => {
    expect(checkPassword("rätt-lösenord", "ip:1")).toBe("ok");
    expect(checkPassword("fel", "ip:1")).toBe("wrong");
  });

  it("throttles after five failed attempts, per key", () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect(checkPassword("fel", "ip:2")).toBe("wrong");
    }
    expect(checkPassword("fel", "ip:2")).toBe("throttled");
    expect(checkPassword("rätt-lösenord", "ip:2")).toBe("throttled");
    // A different caller is unaffected, and the window expires.
    expect(checkPassword("rätt-lösenord", "ip:3")).toBe("ok");
    expect(checkPassword("rätt-lösenord", "ip:2", Date.now() + 16 * 60 * 1000)).toBe("ok");
  });

  it("never spends a try on a correct password", () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(checkPassword("rätt-lösenord", "ip:4")).toBe("ok");
    }
  });

  it("says so when the environment has no password at all", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(checkPassword("vad som helst", "ip:5")).toBe("unconfigured");
  });
});

describe("the github backend", () => {
  const calls: { url: string; method: string; body?: Record<string, unknown> }[] = [];

  function stubFetch(responses: Record<string, { status: number; body: unknown }>) {
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({
        url,
        method: init?.method ?? "GET",
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined,
      });
      const key = Object.keys(responses).find((pattern) => url.includes(pattern));
      const answer = key ? responses[key] : { status: 404, body: { message: "Not Found" } };
      return new Response(JSON.stringify(answer.body), { status: answer.status });
    }) as typeof fetch;
  }

  beforeEach(() => {
    calls.length = 0;
    clearGithubCache();
    process.env.GITHUB_TOKEN = "ghp-testtoken";
    process.env.GITHUB_REPO = "antonmarklundcom/startaeget";
    process.env.GITHUB_BRANCH = "main";
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPO;
    delete process.env.GITHUB_BRANCH;
    globalThis.fetch = realFetch;
  });

  it("reads a file from the branch, base64-decoded", async () => {
    const file = toFileContents(frontmatter, body);
    stubFetch({
      "contents/content/articles/blogg/rundgang-test.mdx": {
        status: 200,
        body: { content: Buffer.from(file, "utf8").toString("base64"), sha: "blob123" },
      },
    });
    const api = githubApi();
    const found = await api?.readFile("content/articles/blogg/rundgang-test.mdx");
    expect(found?.sha).toBe("blob123");
    expect(found?.contents).toBe(file);
    expect(calls[0].url).toContain("?ref=main");
    expect(calls[0].url).toContain("/repos/antonmarklundcom/startaeget/contents/");
  });

  it("caches a read instead of spending a request per render", async () => {
    stubFetch({ contents: { status: 200, body: { content: "eA==", sha: "s" } } });
    const api = githubApi();
    await api?.readFile("content/articles/blogg/a.mdx");
    await api?.readFile("content/articles/blogg/a.mdx");
    expect(calls).toHaveLength(1);
  });

  it("PUTs the file with the loaded sha and an `admin:` commit message", async () => {
    stubFetch({
      contents: { status: 200, body: { commit: { sha: "abcdef1234567890" } } },
    });
    const api = githubApi();
    const outcome = await api?.putFile("content/articles/blogg/x.mdx", "innehåll", "admin: Rubrik", "oldsha");
    expect(outcome).toEqual({ ok: true, commit: "abcdef1" });
    const put = calls.find((call) => call.method === "PUT");
    expect(put?.body).toMatchObject({
      message: "admin: Rubrik",
      branch: "main",
      sha: "oldsha",
    });
    expect(Buffer.from(String(put?.body?.content), "base64").toString("utf8")).toBe("innehåll");
  });

  it("reports GitHub's own message when the sha is stale", async () => {
    stubFetch({ contents: { status: 409, body: { message: "is at 111 but expected 222" } } });
    const api = githubApi();
    const outcome = await api?.putFile("content/articles/blogg/x.mdx", "a", "admin: X", "stale");
    expect(outcome).toEqual({
      ok: false,
      error: "GitHub svarade 409: is at 111 but expected 222",
    });
  });

  it("is not configured without a token", () => {
    delete process.env.GITHUB_TOKEN;
    expect(githubApi()).toBeNull();
    expect(githubConfig()).toBeNull();
  });

  it("defaults the branch to main", () => {
    delete process.env.GITHUB_BRANCH;
    expect(githubConfig()?.branch).toBe("main");
  });
});
