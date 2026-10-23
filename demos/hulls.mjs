#!/usr/bin/env node
// Records the hull turntables in docs/demos: each hull in the hull viewer, turned a full circle on the water.
//
//   cd frontend && npm run build && node ../fork/build-standalone.mjs
//   node ../demos/hulls.mjs                       # every hull below
//   node ../demos/hulls.mjs catamaran-12m         # one of them
//
// Serves dist/standalone, opens hulls.html?bare in a headless Chrome, and renders the turn one frame at a time
// (the camera set to each angle, then a screenshot), so the motion is exactly even whatever the machine. The frames
// become a GIF with ffmpeg (a palette from the frames themselves) and, when it is installed, gifsicle. CHROME_PATH
// overrides the browser.

import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "dist/standalone");
const out = join(root, "docs/demos");
const work = join(root, "dist/demo-frames");
const puppeteer = createRequire(join(root, "frontend/package.json"))("puppeteer-core");

/** The hulls, and how high above the water the camera circles each (degrees). */
const HULLS = {
  "sailing-yacht-10m-keel": 14,
  "rib-6.5m-with-tube": 20,
  "catamaran-12m": 18,
  "swath-25m": 12,
  "container-ship-300m": 16,
};
/** One full turn takes SECONDS (a comfortable 6 s, played at half speed), at FPS frames a second, WIDTH pixels wide. */
const SECONDS = 12;
const FPS = 15;
const WIDTH = 800;
const HEIGHT = 450;

if (!existsSync(join(dir, "accurona-hulls.js"))) {
  console.error("No standalone build: run node ../fork/build-standalone.mjs first.");
  process.exit(2);
}
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(HULLS);
const TYPES = { ".html": "text/html", ".js": "text/javascript" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(dir, path);
  if (!file.startsWith(dir) || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}/hulls.html?bare`;

const executablePath = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"]
  .filter(Boolean)
  .find((p) => existsSync(p));
const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
mkdirSync(out, { recursive: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  for (const name of names) {
    if (!(name in HULLS)) throw new Error(`no such hull in the recording list: ${name}`);
    await page.goto(`${base}&hull=${encodeURIComponent(name)}`, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => window.hullViewer?.state().curve.length === 17, { timeout: 60000 });
    const frames = join(work, name);
    rmSync(frames, { recursive: true, force: true });
    mkdirSync(frames, { recursive: true });
    const count = SECONDS * FPS;
    for (let i = 0; i < count; i++) {
      // start on the starboard quarter and go once round
      await page.evaluate(
        (az, el) =>
          new Promise((ok) => {
            window.hullViewer.orbit(az, el);
            requestAnimationFrame(() => requestAnimationFrame(ok));
          }),
        225 + (360 * i) / count,
        HULLS[name],
      );
      writeFileSync(join(frames, `${String(i).padStart(4, "0")}.png`), await page.screenshot({ type: "png" }));
    }
    const gif = join(out, `hull-${name}.gif`);
    const filters = ["split[a][b]", "[a]palettegen=max_colors=128:stats_mode=full[p]", "[b][p]paletteuse=dither=bayer:bayer_scale=4"].join(";");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", join(frames, "%04d.png"), "-filter_complex", filters, "-loop", "0", gif], { stdio: "inherit" });
    try {
      execFileSync("gifsicle", ["-O3", "--lossy=40", "-o", gif, gif], { stdio: "inherit" });
    } catch {
      console.warn("gifsicle not found: GIF left unoptimised");
    }
    console.log(`${gif}  ${Math.round(statSync(gif).size / 1024)} KB, ${count} frames`);
  }
} finally {
  await browser.close();
  server.close();
}
