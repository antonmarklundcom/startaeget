#!/usr/bin/env node
/**
 * tests/screenshots.mjs — one screenshot pass, mobile and desktop (plan §4.13).
 *
 *   node tests/screenshots.mjs                 build, start, shoot the defaults
 *   node tests/screenshots.mjs --fast          reuse the existing .next
 *   node tests/screenshots.mjs /a/ /b/         shoot these paths instead
 *
 * Output lands in docs/screenshots/ (git-ignored — CI uploads it as the PR
 * artifact instead, plan §4.14).
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs/screenshots");
const PORT = Number(process.env.SCREENSHOT_PORT ?? 4322);
const BASE = `http://127.0.0.1:${PORT}`;

const args = process.argv.slice(2);
const fast = args.includes("--fast");
const paths = args.filter((a) => a.startsWith("/"));

const ROUTES = paths.length
  ? paths
  : [
      "/",
      "/starta-foretag/",
      "/starta-aktiebolag/",
      "/basta-bokforingsprogram/",
      "/verktyg/bolagsform/",
    ];

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 900 },
];

if (!fast) {
  const build = spawnSync("npx", ["next", "build"], { cwd: ROOT, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

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

/**
 * Cloud sessions ship a pre-installed Chromium whose build may not match the
 * pinned @playwright/test version. Point at it explicitly when it is there;
 * fall back to Playwright's own download (what CI uses) otherwise.
 */
function chromiumExecutable() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;
  const candidate = fs
    .readdirSync(base)
    .filter((name) => name.startsWith("chromium-"))
    .map((name) => path.join(base, name, "chrome-linux/chrome"))
    .find((file) => fs.existsSync(file));
  return candidate;
}

const problems = [];

try {
  if (!(await waitForServer())) throw new Error(`server never came up on ${BASE}`);

  const executablePath = chromiumExecutable();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      locale: "sv-SE",
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: "load" });
      await page.waitForTimeout(300);
      if (!response || response.status() !== 200) {
        problems.push(`${route} answered ${response?.status() ?? "no response"}`);
        continue;
      }

      // No page may scroll sideways at any width (plan §5.2 exit criterion).
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) {
        problems.push(`${route} at ${viewport.width}px scrolls ${overflow}px horizontally`);
      }

      const name = route === "/" ? "home" : route.replaceAll("/", "").replaceAll(".", "-");
      await page.screenshot({
        path: path.join(OUT, `${name}-${viewport.name}.png`),
        fullPage: true,
      });
    }
    await context.close();
  }
  await browser.close();
} finally {
  killServer();
}

const count = fs.readdirSync(OUT).length;
process.stdout.write(`\n${count} screenshots written to docs/screenshots/\n`);

if (problems.length) {
  process.stdout.write(`\nProblems:\n${problems.map((p) => `  - ${p}`).join("\n")}\n\n`);
  process.exit(1);
}
