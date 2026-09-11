#!/usr/bin/env node
/**
 * tests/tools.e2e.mjs — one scripted interaction pass over the three tools
 * (plan §4.13, §5.3 exit criterion). Drives each one from its first question to
 * a finished result in a real browser, the way a visitor would.
 *
 *   node tests/tools.e2e.mjs            build, start, run
 *   node tests/tools.e2e.mjs --fast     reuse the existing .next
 *
 * Exits non-zero with a list of what failed. Silent success is the pass.
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = Number(process.env.E2E_PORT ?? 4323);
const BASE = `http://127.0.0.1:${PORT}`;
const fast = process.argv.includes("--fast");

if (!fast) {
  const build = spawnSync("npx", ["next", "build"], { cwd: ROOT, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  env: { ...process.env, NODE_ENV: "production" },
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
process.on("exit", killServer);

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

const money = (text) => Number(String(text).replace(/[^\d]/g, ""));

/** Tool 1: answer every question by clicking, then read the verdict. */
async function bolagsform(page) {
  await page.goto(`${BASE}/verktyg/bolagsform/`, { waitUntil: "load" });

  const label = "bolagsform";
  check(
    (await page.locator('[data-testid="verdict"]').count()) === 0,
    `${label}: a verdict appeared before any question was answered`,
  );

  for (let step = 0; step < 12; step += 1) {
    if (await page.locator('[data-testid="all-answered"]').count()) break;
    const options = page.locator(".q__options .q__option");
    const count = await options.count();
    if (count === 0) break;
    // Always take the last option, which is the aktiebolag-leaning answer.
    await options.nth(count - 1).click();
    await page.waitForTimeout(60);
  }

  const verdict = page.locator('[data-testid="verdict"]');
  check(await verdict.count(), `${label}: no verdict after answering every question`);
  if (await verdict.count()) {
    const text = (await verdict.first().textContent())?.trim() ?? "";
    check(text.length > 0, `${label}: verdict rendered empty`);
    check(
      ["Aktiebolag", "Enskild firma", "Handelsbolag"].includes(text),
      `${label}: unexpected verdict "${text}"`,
    );
  }

  // The answers are in the URL, so the result survives a reload.
  const url = page.url();
  check(url.includes("?"), `${label}: answers were not written to the URL`);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(150);
  check(
    await page.locator('[data-testid="verdict"]').count(),
    `${label}: the verdict did not survive a reload of ${url}`,
  );

  // The result panel must end in partner CTAs and the byrå lead form (§5.3).
  check(await page.locator(".partner-cta").count(), `${label}: no partner CTAs in the result`);
  check(await page.locator(".lead-form").count(), `${label}: no byrå lead form in the result`);
  check(
    await page.locator(".result__estimate").count(),
    `${label}: the "uppskattning" label is missing`,
  );
  check(
    await page.locator(".sources-box a").count(),
    `${label}: the result cites no sources`,
  );
  check(
    await page.locator('script[type="application/ld+json"]').count(),
    `${label}: no JSON-LD on the page`,
  );
}

/** Tool 2: switch form, edit a line, watch the totals move. */
async function startkostnad(page) {
  const label = "startkostnad";
  await page.goto(`${BASE}/verktyg/startkostnad/`, { waitUntil: "load" });

  const once = page.locator('[data-testid="total-once"]');
  const monthly = page.locator('[data-testid="total-monthly"]');
  const firstYear = page.locator('[data-testid="total-first-year"]');
  check(await once.count(), `${label}: no "vid start" total rendered`);

  const abOnce = money(await once.first().textContent());
  check(abOnce > 25_000, `${label}: aktiebolag start total ${abOnce} does not include aktiekapital`);

  // Editing a line must move the monthly total.
  const monthlyBefore = money(await monthly.first().textContent());
  const bokforing = page.locator("#line-bokforingsprogram");
  check(await bokforing.count(), `${label}: the bokföringsprogram line is missing`);
  await bokforing.fill("500");
  await page.waitForTimeout(120);
  const monthlyAfter = money(await monthly.first().textContent());
  check(
    monthlyAfter !== monthlyBefore,
    `${label}: editing a line did not change the monthly total (${monthlyBefore} → ${monthlyAfter})`,
  );

  // First year must equal once + 12 months, as rendered.
  const renderedOnce = money(await once.first().textContent());
  const renderedYear = money(await firstYear.first().textContent());
  check(
    renderedYear === renderedOnce + monthlyAfter * 12,
    `${label}: first-year total ${renderedYear} ≠ ${renderedOnce} + 12 × ${monthlyAfter}`,
  );

  // Switching to enskild firma must drop aktiekapital entirely.
  await page.locator('.q__option[data-option="enskild"]').click();
  await page.waitForTimeout(120);
  const enskildOnce = money(await once.first().textContent());
  check(
    enskildOnce < abOnce,
    `${label}: enskild firma (${enskildOnce}) should cost less at start than aktiebolag (${abOnce})`,
  );
  check(
    (await page.locator("#line-aktiekapital").count()) === 0,
    `${label}: the aktiekapital line is still shown for enskild firma`,
  );

  // Edits belong in the URL and must survive a reload.
  check(page.url().includes("form=enskild"), `${label}: the form was not written to the URL`);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(150);
  check(
    money(await page.locator('[data-testid="total-once"]').first().textContent()) === enskildOnce,
    `${label}: the total did not survive a reload of ${page.url()}`,
  );

  check(await page.locator(".partner-cta").count(), `${label}: no partner CTAs in the result`);
  check(await page.locator(".lead-form").count(), `${label}: no byrå lead form in the result`);
  check(await page.locator(".sources-box a").count(), `${label}: the result cites no sources`);
}

/** Tool 3: type revenue and costs, compare the two columns. */
async function vadBlirKvar(page) {
  const label = "vad-blir-kvar";
  await page.goto(`${BASE}/verktyg/vad-blir-kvar/`, { waitUntil: "load" });

  const netEnskild = page.locator('[data-testid="net-enskild"]');
  const netAb = page.locator('[data-testid="net-ab"]');
  check(await netEnskild.count(), `${label}: the enskild firma column is missing`);
  check(await netAb.count(), `${label}: the aktiebolag column is missing`);

  await page.locator("#omsattning").fill("1800000");
  await page.locator("#kostnader").fill("200000");
  await page.waitForTimeout(150);

  const enskild = money(await netEnskild.first().textContent());
  const ab = money(await netAb.first().textContent());
  check(enskild > 0 && ab > 0, `${label}: a column came out at zero (${enskild} / ${ab})`);
  check(
    enskild < 1_600_000 && ab < 1_600_000,
    `${label}: a column left more than the surplus (${enskild} / ${ab})`,
  );
  check(
    ab > enskild,
    `${label}: at 1,6 Mkr surplus the aktiebolag should leave more (${ab} vs ${enskild})`,
  );
  check(
    await page.locator('[data-testid="difference"]').count(),
    `${label}: the difference line is missing`,
  );

  // A loss must zero both columns rather than produce a negative.
  await page.locator("#omsattning").fill("100000");
  await page.locator("#kostnader").fill("300000");
  await page.waitForTimeout(150);
  check(
    money(await netEnskild.first().textContent()) === 0 &&
      money(await netAb.first().textContent()) === 0,
    `${label}: a loss did not zero both columns`,
  );

  // The assumptions and the estimate label are non-negotiable here (§5.3).
  const assumptions = await page.locator(".assumptions li").count();
  check(assumptions >= 5, `${label}: only ${assumptions} assumptions listed, expected at least 5`);
  check(
    await page.locator(".result__estimate").count(),
    `${label}: the "uppskattning" label is missing`,
  );

  check(page.url().includes("omsattning="), `${label}: inputs were not written to the URL`);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(150);
  check(
    money(await page.locator("#omsattning").first().inputValue()) === 100_000,
    `${label}: the inputs did not survive a reload`,
  );

  check(await page.locator(".partner-cta").count(), `${label}: no partner CTAs in the result`);
  check(await page.locator(".lead-form").count(), `${label}: no byrå lead form in the result`);
}

/** The home hero must ask tool 1's question and hand the answer over. */
async function heroHandoff(page) {
  const label = "home hero";
  await page.goto(`${BASE}/`, { waitUntil: "load" });

  const slot = page.locator("#hero-tool-slot");
  check(await slot.count(), `${label}: the tool slot is missing from the hero`);

  const question = (await slot.locator(".tool-slot__question").textContent())?.trim() ?? "";
  check(question.length > 10, `${label}: the slot asks no question`);

  const options = slot.locator(".tool-slot__options a");
  const count = await options.count();
  check(count >= 2, `${label}: the slot offers only ${count} answers`);

  // Follow one and confirm the tool opened with that answer recorded.
  await options.first().click();
  await page.waitForURL(/\/verktyg\/bolagsform\//, { timeout: 10_000 });
  await page.waitForTimeout(200);

  check(
    page.url().includes("vinst="),
    `${label}: the answer was not carried into the tool (${page.url()})`,
  );

  const toolQuestion =
    (await page.locator(".q__title").first().textContent())?.trim() ?? "";
  check(
    toolQuestion !== question,
    `${label}: the tool re-asks the question the hero already answered`,
  );

  const answered = await page.locator(".answers__row").count();
  check(answered >= 1, `${label}: the tool recorded no answer from the hero`);
}

try {
  if (!(await waitForServer())) throw new Error(`server never came up on ${BASE}`);

  const executablePath = chromiumExecutable();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "sv-SE",
  });
  const page = await context.newPage();

  page.on("pageerror", (error) => problems.push(`uncaught page error: ${error.message}`));
  // A bare "404 (Not Found)" console line names no URL, so record the response
  // itself — a failure here has to say which request broke to be actionable.
  page.on("response", (response) => {
    if (response.status() >= 400) {
      problems.push(`${response.request().method()} ${response.url()} answered ${response.status()}`);
    }
  });
  page.on("requestfailed", (request) => {
    problems.push(`${request.url()} failed: ${request.failure()?.errorText ?? "unknown"}`);
  });
  page.on("console", (message) => {
    const text = message.text();
    // The matching response listener above reports these with their URL.
    if (message.type() === "error" && !/Failed to load resource/.test(text)) {
      problems.push(`console error: ${text}`);
    }
  });

  for (const [name, run] of [
    ["bolagsform", bolagsform],
    ["startkostnad", startkostnad],
    ["vad-blir-kvar", vadBlirKvar],
    ["hero", heroHandoff],
  ]) {
    process.stdout.write(`  ${name} … `);
    const before = problems.length;
    await run(page);
    process.stdout.write(problems.length === before ? "ok\n" : "FAIL\n");
  }

  await context.close();
  await browser.close();
} catch (error) {
  problems.push(error.stack ?? String(error));
} finally {
  killServer();
}

if (problems.length) {
  console.error(`\ntools e2e FAILED — ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}
console.log("\ntools e2e green — all three tools complete a full run");
