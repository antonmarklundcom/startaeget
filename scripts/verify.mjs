#!/usr/bin/env node
/**
 * scripts/verify.mjs — the contract every phase runs before opening its PR.
 *
 *   node scripts/verify.mjs            build + typecheck + lint + runtime checks
 *   node scripts/verify.mjs --fast     skip the build and reuse the existing .next
 *
 * Every failure names the file or URL, what was expected and what came back.
 * Warnings never fail the run — they are the things a later phase fills in.
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = Number(process.env.VERIFY_PORT ?? 4321);
const BASE = `http://127.0.0.1:${PORT}`;
const FAST = process.argv.includes("--fast");
// Windows needs a shell to resolve npx.cmd; keep direct spawning on Linux.
const NPX_SHELL = process.platform === "win32";

const ESC = String.fromCharCode(27);
const bold = (s) => `${ESC}[1m${s}${ESC}[0m`;
const red = (s) => `${ESC}[31m${s}${ESC}[0m`;
const green = (s) => `${ESC}[32m${s}${ESC}[0m`;
const yellow = (s) => `${ESC}[33m${s}${ESC}[0m`;

const errors = [];
const warnings = [];
let checks = 0;
let server = null;

function fail(where, message) {
  errors.push(`${where}\n    ${message}`);
}
function warn(where, message) {
  warnings.push(`${where} — ${message}`);
}
function ok(label) {
  checks += 1;
  process.stdout.write(`  ${green("OK")} ${label}\n`);
}
function step(label) {
  process.stdout.write(`\n${bold(label)}\n`);
}

function run(label, command, args) {
  const started = Date.now();
  const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8", env: process.env, shell: NPX_SHELL });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    fail(label, output.split("\n").slice(-40).join("\n    ") || `exit code ${result.status}`);
    process.stdout.write(`  ${red("XX")} ${label} (${seconds}s)\n`);
    return false;
  }
  ok(`${label} (${seconds}s)`);
  return true;
}

function killServer() {
  if (!server) return;
  try {
    process.kill(-server.pid, "SIGKILL");
  } catch {
    server.kill("SIGKILL");
  }
}

function report() {
  killServer();

  if (warnings.length) {
    process.stdout.write(`\n${bold(yellow(`Warnings (${warnings.length})`))}\n`);
    for (const warning of warnings) process.stdout.write(`  ${yellow("!")} ${warning}\n`);
  }

  if (errors.length) {
    process.stdout.write(`\n${bold(red(`FAILED — ${errors.length} problem(s)`))}\n`);
    for (const error of errors) process.stdout.write(`\n  ${red("XX")} ${error}\n`);
    process.stdout.write("\n");
    process.exit(1);
  }

  process.stdout.write(`\n${bold(green(`verify green — ${checks} checks passed`))}\n\n`);
  process.exit(0);
}

// --- 1. Static checks -------------------------------------------------------

step("Static checks");
const buildOk = FAST ? true : run("next build", "npx", ["next", "build"]);
run("typecheck", "npx", ["tsc", "--noEmit"]);
run("lint", "npx", ["eslint", "."]);
if (!buildOk) report();

// --- 2. Content contract ----------------------------------------------------
// The build validates every MDX file through the loader (a bad file fails the
// build with its path and field). These checks cover what the loader cannot see.

step("Content contract");

const legacy = JSON.parse(fs.readFileSync(path.join(ROOT, "content/legacy-urls.json"), "utf8"));
if (!legacy.complete) {
  warn(
    "content/legacy-urls.json",
    'marked "complete": false — the full WordPress path list is human input (plan §7 item 1)',
  );
}
ok(`legacy-urls.json parsed (${legacy.entries.length} entries)`);

const affiliates = fs.readFileSync(path.join(ROOT, "content/affiliates.ts"), "utf8");
if (!/^\s*affiliateUrl:\s*"http/m.test(affiliates)) {
  warn(
    "content/affiliates.ts",
    "no affiliate program enrolled yet — every /go/ link uses its fallback (plan §7 item 5)",
  );
}
ok("partner registry readable");

const expectedUrls = (() => {
  const result = spawnSync("npx", ["tsx", "scripts/expected-urls.ts"], {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
    shell: NPX_SHELL,
  });
  if (result.status !== 0) {
    fail("scripts/expected-urls.ts", `${result.stdout ?? ""}${result.stderr ?? ""}`.trim());
    return [];
  }
  return JSON.parse(result.stdout.trim());
})();
ok(`content loaders resolve (${expectedUrls.length} indexable URLs)`);

// --- 3. Runtime checks ------------------------------------------------------

step("Runtime checks");

server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  env: { ...process.env, NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
  shell: NPX_SHELL,
});

let serverLog = "";
server.stdout.on("data", (chunk) => (serverLog += chunk));
server.stderr.on("data", (chunk) => (serverLog += chunk));
process.on("exit", killServer);

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/`, { redirect: "manual" });
      if (response.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

const head = (url) => fetch(url, { redirect: "manual" });

async function main() {
  if (!(await waitForServer())) {
    fail("next start", `no answer on ${BASE} within 30s\n    ${serverLog.slice(-800)}`);
    return;
  }
  ok("production server up");

  // 3.1 Core routes render.
  const core = [
    "/",
    "/starta-foretag/",
    "/ekonomi/",
    "/jamfor/",
    "/verktyg/",
    "/verktyg/bolagsform/",
  ];
  for (const route of core) {
    const response = await head(`${BASE}${route}`);
    if (response.status !== 200) fail(route, `expected 200, got ${response.status}`);
  }
  ok(`core routes 200 (${core.length})`);

  // 3.2 Sitemap.
  const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const sitemapPaths = new Set(
    [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
  );
  if (sitemapPaths.size === 0) fail("/sitemap.xml", "contains no <loc> entries");
  for (const pathname of expectedUrls) {
    if (!sitemapPaths.has(pathname)) fail("/sitemap.xml", `missing ${pathname}`);
  }
  ok(`sitemap complete (${sitemapPaths.size} URLs)`);

  // 3.3 Every indexable page: 200, title, description, canonical, h1, no
  //     placeholder text.
  const placeholders = [
    [/example\.com/i, "an example.com link"],
    [/lorem ipsum/i, "lorem ipsum"],
    [/href="#"/i, 'an href="#" placeholder link'],
    [/\bTODO\b/, "a TODO marker"],
    [/\bTBD\b/, "a TBD marker"],
  ];
  const internalLinks = new Map();

  for (const pathname of sitemapPaths) {
    const response = await fetch(`${BASE}${pathname}`);
    if (response.status !== 200) {
      fail(pathname, `listed in the sitemap but answered ${response.status}`);
      continue;
    }
    const html = await response.text();

    if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(pathname, "missing or empty <title>");
    if (!/<meta name="description" content="[^"]{20,}"/.test(html)) {
      fail(pathname, "missing meta description");
    }
    if (!/rel="canonical"/.test(html)) fail(pathname, "missing canonical link");
    if (!/<h1[^>]*>/.test(html)) fail(pathname, "missing <h1>");

    for (const [pattern, label] of placeholders) {
      if (pattern.test(html)) fail(pathname, `contains ${label}`);
    }
    for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      if (!internalLinks.has(match[1])) internalLinks.set(match[1], pathname);
    }
  }
  ok(`indexable pages carry metadata and no placeholders (${sitemapPaths.size})`);

  // 3.4 Legacy URLs never 404.
  let kept = 0;
  let redirected = 0;
  for (const entry of legacy.entries) {
    const response = await head(`${BASE}${entry.path}`);
    if (response.status === 200) {
      kept += 1;
    } else if (response.status === 301 || response.status === 308) {
      redirected += 1;
      if (!response.headers.get("location")) {
        fail(entry.path, `${response.status} without a Location header`);
      }
    } else {
      fail(entry.path, `expected 200 or 301, got ${response.status}`);
    }
  }
  ok(`legacy URLs answer (${kept} kept, ${redirected} redirected)`);

  // 3.5 Affiliate redirect.
  const go = await head(`${BASE}/go/bokio/`);
  if (go.status !== 302) fail("/go/bokio/", `expected 302, got ${go.status}`);
  const goTarget = go.headers.get("location") ?? "";
  if (!goTarget.startsWith("https://")) {
    fail("/go/bokio/", `Location is not an absolute https URL: "${goTarget}"`);
  }
  if (!/noindex/.test(go.headers.get("x-robots-tag") ?? "")) {
    fail("/go/bokio/", "missing X-Robots-Tag: noindex");
  }
  ok(`/go/bokio/ redirects to ${goTarget}`);

  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  if (!/Disallow:\s*\/go\//.test(robots)) fail("/robots.txt", "does not disallow /go/");
  ok("robots.txt disallows /go/");

  // 3.6 The three POST routes, with no env var set at all.
  const posts = [
    [
      "/api/lead",
      {
        type: "byra",
        name: "Verify Testsson",
        email: "verify@startaegetforetag.invalid",
        phone: "0701234567",
        sourcePage: "/verify/",
        message: "Testinlagg fran verify.mjs",
      },
    ],
    ["/api/subscribe", { email: "verify@startaegetforetag.invalid", source: "/verify/" }],
    [
      "/api/tool-result",
      { tool: "bolagsform", email: "verify@startaegetforetag.invalid", payload: { answer: "ab" } },
    ],
  ];
  for (const [route, payload] of posts) {
    const response = await fetch(`${BASE}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (response.status !== 200 || body.ok !== true) {
      fail(route, `expected 200 {ok:true}, got ${response.status} ${JSON.stringify(body)}`);
    }
  }
  ok("form routes accept a submission with no env var set");

  const spam = await fetch(`${BASE}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bot@startaegetforetag.invalid", website: "http://spam" }),
  });
  if ((await spam.json()).stored !== false) fail("/api/subscribe", "honeypot submission was stored");

  const invalid = await fetch(`${BASE}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "x" }),
  });
  if (invalid.status !== 422) {
    fail("/api/lead", `an invalid payload should answer 422, got ${invalid.status}`);
  }
  ok("honeypot and validation behave");

  // 3.7 Internal links. Targets a later phase owns are warnings, not failures.
  const seen = new Set();
  for (const [href, from] of internalLinks) {
    if (seen.has(href) || href.startsWith("/go/") || href.startsWith("/api/")) continue;
    seen.add(href);
    const response = await head(`${BASE}${href}`);
    if (response.status >= 400) {
      warn(href, `linked from ${from}, answered ${response.status} — a later phase adds this page`);
    }
  }
  ok(`internal links resolve (${seen.size} checked)`);
}

main()
  .catch((error) => fail("verify.mjs", error.stack ?? String(error)))
  .finally(report);
