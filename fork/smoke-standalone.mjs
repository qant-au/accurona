// Accurona: a smoke check of the standalone build (run fork/build-standalone.mjs first).
//
//   cd frontend && node ../fork/smoke-standalone.mjs
//
// Serves dist/standalone, opens the demo page in a headless Chrome, and checks that the planner mounts with no
// Home Assistant: the panel renders, the editor opens, a plan saved through the host comes back. Any error the
// page throws fails the check. Writes dist/standalone-smoke.png. CHROME_PATH overrides the browser.

import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "dist/standalone");
const puppeteer = createRequire(join(root, "frontend/package.json"))("puppeteer-core");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png" };

if (!existsSync(join(dir, "accurona-host.js"))) {
  console.error("No standalone build: run node ../fork/build-standalone.mjs first.");
  process.exit(2);
}
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(dir, path === "/" ? "index.html" : path);
  if (!file.startsWith(dir) || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const url = `http://127.0.0.1:${server.address().port}/index.html?fresh&lang=en`;

const executablePath = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean).find((p) => existsSync(p));
const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const failures = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.on("pageerror", (err) => failures.push(`page error: ${err.message}`));
  page.on("requestfailed", (req) => failures.push(`request failed: ${req.url()}`));
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.accurona?.element?.shadowRoot?.querySelector("h1"), { timeout: 15000 });

  const title = await page.evaluate(() => window.accurona.element.shadowRoot.querySelector("h1").textContent.trim());
  if (title !== "Accurona") failures.push(`panel title is "${title}"`);

  // the editor opens (its own bundle, loaded lazily beside the main one)
  await page.evaluate(() => {
    const tabs = [...window.accurona.element.shadowRoot.querySelectorAll(".fp3d-seg button")];
    tabs.find((b) => b.getAttribute("aria-pressed") === "false" && !b.classList.contains("fp3d-tab-ext"))?.click();
  });
  await page.waitForFunction(() => customElements.get("accurona-editor"), { timeout: 15000 });
  const tabs = await page.evaluate(() =>
    [...window.accurona.element.shadowRoot.querySelectorAll(".fp3d-seg button")].filter((b) => getComputedStyle(b).display !== "none").length,
  );
  if (tabs !== 2) failures.push(`expected the View and Editor tabs only (no shop page), found ${tabs}`);

  // a plan saved through the host comes back from it
  const revision = await page.evaluate(async () => {
    const hass = window.accurona.element.hass;
    const { building } = await hass.callWS({ type: "accurona/building/get" });
    await hass.callWS({ type: "accurona/building/save", building: { ...building, floors: [{ id: "f1", name: "Deck", elevation: 0, height: 2.1, rooms: [], walls: [], openings: [], furniture: [] }] } });
    return (await hass.callWS({ type: "accurona/building/get" })).revision;
  });
  if (revision !== 1) failures.push(`saved plan came back at revision ${revision}`);

  await new Promise((ok) => setTimeout(ok, 1500));
  await page.screenshot({ path: join(root, "dist/standalone-smoke.png") });
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(failures.map((f) => `FAIL ${f}`).join("\n"));
  process.exit(1);
}
console.log("ok   standalone planner mounts, opens the editor and keeps a saved plan (dist/standalone-smoke.png)");
