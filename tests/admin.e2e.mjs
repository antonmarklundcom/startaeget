#!/usr/bin/env node
/**
 * tests/admin.e2e.mjs — the scripted pass over /admin/ in local mode (plan §5.5
 * exit criterion): log in, create a post, insert a link from the picker, save,
 * check the file on disk validates, preview it, then delete it.
 *
 *   node tests/admin.e2e.mjs            build, start, run
 *   node tests/admin.e2e.mjs --fast     reuse the existing .next
 *
 * Runs with ADMIN_PASSWORD + ADMIN_SESSION_SECRET set and no GITHUB_TOKEN, so
 * the store is the local backend and the test writes into the repo's own
 * content/ — the temporary file is removed even when an assertion fails.
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = Number(process.env.ADMIN_E2E_PORT ?? 4324);
const BASE = `http://127.0.0.1:${PORT}`;
const fast = process.argv.includes("--fast");

const PASSWORD = "e2e-losenord-som-ingen-anvander";
const SECRET = "e2e-session-secret-0123456789abcdef";
const SLUG = "e2e-testpost-admin";
const FILE = path.join(ROOT, "content/articles/blogg", `${SLUG}.mdx`);

const BODY = `Det här är en testpost som tests/admin.e2e.mjs skapar och tar bort igen. Den finns
bara så länge testet kör, och den ska aldrig hamna i ett commit.

## Första rubriken

Texten behöver vara minst tvåhundra tecken för att loadern ska släppa igenom
filen, så det här stycket är med för att fylla ut den kvoten med något som går
att läsa. Länken nedan sätts in med länkväljaren i verktygsraden.

`;

if (!fast) {
  const build = spawnSync("npx", ["next", "build"], { cwd: ROOT, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  env: {
    ...process.env,
    NODE_ENV: "production",
    ADMIN_PASSWORD: PASSWORD,
    ADMIN_SESSION_SECRET: SECRET,
    // Local backend: the GitHub path is unit-tested, not driven from a browser.
    GITHUB_TOKEN: "",
    GITHUB_REPO: "",
  },
  stdio: ["ignore", "ignore", "ignore"],
  detached: true,
});

function killServer() {
  try {
    process.kill(-server.pid, "SIGKILL");
  } catch {
    server.kill("SIGKILL");
  }
}
function cleanup() {
  killServer();
  if (fs.existsSync(FILE)) fs.rmSync(FILE);
}
process.on("exit", cleanup);

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

/** Same Chromium resolution as tests/screenshots.mjs. */
function chromiumExecutable() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;
  return fs
    .readdirSync(base)
    .filter((name) => name.startsWith("chromium-"))
    .map((name) => path.join(base, name, "chrome-linux/chrome"))
    .find((file) => fs.existsSync(file));
}

const problems = [];
function check(condition, message) {
  if (!condition) problems.push(message);
}

if (fs.existsSync(FILE)) fs.rmSync(FILE);

try {
  if (!(await waitForServer())) throw new Error(`no answer on ${BASE}`);

  // The guard, before a browser is involved at all.
  const guarded = await fetch(`${BASE}/admin/`, { redirect: "manual" });
  check(guarded.status === 302, `/admin/ unauthenticated answered ${guarded.status}, expected 302`);
  check(
    guarded.headers.get("location") === "/admin/login/",
    `/admin/ redirected to ${guarded.headers.get("location")}, expected /admin/login/`,
  );

  const loginHtml = await (await fetch(`${BASE}/admin/login/`)).text();
  check(/noindex/.test(loginHtml), "/admin/login/ does not carry noindex");

  const browser = await chromium.launch({ executablePath: chromiumExecutable() });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. A wrong password is refused.
  process.stdout.write("  login … ");
  await page.goto(`${BASE}/admin/`, { waitUntil: "load" });
  check(page.url().includes("/admin/login/"), `expected the login screen, landed on ${page.url()}`);
  await page.fill('input[name="password"]', "fel-losenord");
  await page.click('button[type="submit"]');
  await page.waitForSelector(".adm-chip--error", { timeout: 10_000 });
  check(
    (await page.locator(".adm-chip--error").textContent())?.includes("Fel lösenord"),
    "a wrong password did not produce the 'Fel lösenord' message",
  );

  // 2. The real password gets in.
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/$/, { timeout: 15_000 });
  check(await page.locator(".adm-table").count(), "the article list did not render after login");
  const listRows = await page.locator(".adm-table tbody tr").count();
  check(listRows > 5, `the list shows ${listRows} articles, expected the repo's content`);
  process.stdout.write("ok\n");

  // 3. Create a post, with the link picker doing the link.
  process.stdout.write("  create … ");
  await page.click('a[href="/admin/ny/"]');
  await page.waitForSelector('textarea[name="body"]');
  await page.fill('input[name="title"]', "Testpost från e2e-körningen");
  await page.fill('input[name="slug"]', SLUG);
  await page.fill(
    'textarea[name="description"]',
    "En temporär post som e2e-testet skapar för att bevisa att admin kan skriva, validera och ta bort en fil.",
  );
  await page.fill('input[name="intent"]', "e2e testpost");
  await page.fill('textarea[name="body"]', BODY);

  await page.click('button:has-text("Infoga länk")');
  await page.fill('.adm-picker input[type="search"]', "Bolagsformsväljaren");
  await page.waitForSelector(".adm-picker__hit");
  await page.click(".adm-picker__hit");
  const withLink = await page.inputValue('textarea[name="body"]');
  check(
    withLink.includes("](/verktyg/bolagsform/)"),
    `the link picker inserted nothing usable: ${withLink.slice(-120)}`,
  );

  await page.click('[data-testid="save"]');
  await page.waitForURL(/\/admin\/artiklar\/blogg\//, { timeout: 20_000 });
  check(fs.existsSync(FILE), `${FILE} was not written`);
  process.stdout.write("ok\n");

  // 4. What landed on disk is what the loader accepts.
  process.stdout.write("  file … ");
  if (fs.existsSync(FILE)) {
    const parsed = matter(fs.readFileSync(FILE, "utf8"));
    check(parsed.data.slug === SLUG, `frontmatter slug is ${parsed.data.slug}`);
    check(parsed.data.hub === "blogg", `frontmatter hub is ${parsed.data.hub}`);
    check(parsed.data.type === "post", `frontmatter type is ${parsed.data.type}`);
    check(
      parsed.data.updated === new Date().toISOString().slice(0, 10),
      `updated is ${parsed.data.updated}, expected today`,
    );
    check(parsed.content.includes("](/verktyg/bolagsform/)"), "the body lost the inserted link");

    const validate = spawnSync("npx", ["tsx", "scripts/expected-urls.ts"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    check(
      validate.status === 0 && validate.stdout.includes(`/${SLUG}/`),
      `the loaders reject the saved file:\n${validate.stderr?.slice(0, 600)}`,
    );
  }
  process.stdout.write("ok\n");

  // 5. Preview compiles the body with the site's own components.
  process.stdout.write("  preview … ");
  await page.click('[data-testid="preview"]');
  await page.waitForSelector(".adm-preview", { timeout: 20_000 });
  const previewText = (await page.locator(".adm-preview").textContent()) ?? "";
  check(previewText.includes("Första rubriken"), "the preview did not render the body");
  check(
    (await page.locator(".adm-preview .adm-errors").count()) === 0,
    `the preview reported a compile error: ${previewText.slice(0, 200)}`,
  );
  process.stdout.write("ok\n");

  // 6. Saving an edit says where it saved.
  process.stdout.write("  save … ");
  await page.fill('input[name="title"]', "Testpost, redigerad av e2e");
  await page.click('[data-testid="save"]');
  await page.waitForSelector('[data-testid="save-state"]', { timeout: 20_000 });
  const saved = (await page.locator('[data-testid="save-state"]').textContent()) ?? "";
  check(/Sparat lokalt/.test(saved), `the save message was "${saved}"`);
  check(
    matter(fs.readFileSync(FILE, "utf8")).data.title === "Testpost, redigerad av e2e",
    "the edited title did not reach the file",
  );

  // Invalid frontmatter is refused, and must not touch the file.
  const onDisk = fs.readFileSync(FILE, "utf8");
  await page.fill('textarea[name="description"]', "För kort.");
  await page.click('[data-testid="save"]');
  await page.waitForSelector('[data-testid="save-errors"]', { timeout: 20_000 });
  check(
    fs.readFileSync(FILE, "utf8") === onDisk,
    "a too-short description reached the file — the validation gate let it through",
  );

  // So is MDX that does not compile.
  await page.fill(
    'textarea[name="description"]',
    "En temporär post som e2e-testet skapar för att bevisa att admin kan skriva, validera och ta bort en fil.",
  );
  await page.fill('textarea[name="body"]', `${BODY}\n<Callout title="Trasig">\n`);
  await page.click('[data-testid="save"]');
  await page.waitForSelector('[data-testid="save-errors"]', { timeout: 20_000 });
  check(
    fs.readFileSync(FILE, "utf8") === onDisk,
    "MDX that does not compile reached the file — the validation gate let it through",
  );
  process.stdout.write("ok\n");

  // 7. Delete.
  process.stdout.write("  delete … ");
  await page.click('[data-testid="delete"]');
  await page.waitForURL(/\/admin\/\?borttagen=1/, { timeout: 20_000 });
  check(!fs.existsSync(FILE), `${FILE} is still on disk after delete`);
  process.stdout.write("ok\n");

  await context.close();
  await browser.close();
} catch (error) {
  problems.push(error.stack ?? String(error));
} finally {
  cleanup();
}

if (problems.length) {
  console.error(`\nadmin e2e FAILED — ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}
console.log("\nadmin e2e green — login, create, link picker, preview, save, validation, delete");
