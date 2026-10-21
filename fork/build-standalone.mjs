// Accurona: the standalone build, the engine with no Home Assistant anywhere.
//
//   cd frontend && npm run build && node ../fork/build-standalone.mjs
//
// dist/standalone/ gets the engine's bundles and assets exactly as built for the integration (the engine is the
// same code), plus accurona-host.js (the embedding API, frontend/src/host/) and a demo page (index.html).
// Serve the folder over HTTP to use it; nothing in it talks to a server.

import { cpSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// esbuild is the frontend's own dev dependency
const { build } = createRequire(join(root, "frontend/package.json"))("esbuild");
const engine = join(root, "custom_components/accurona/frontend");
const out = join(root, "dist/standalone");
const BUDGET = 48 * 1024;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(engine, out, { recursive: true });
cpSync(join(root, "fork/standalone/index.html"), join(out, "index.html"));

await build({
  entryPoints: [join(root, "frontend/src/host/embed.ts")],
  outfile: join(out, "accurona-host.js"),
  bundle: true,
  format: "esm",
  target: ["safari15", "chrome94", "firefox93", "edge94"],
  minify: true,
  legalComments: "none",
  logLevel: "warning",
});

const size = statSync(join(out, "accurona-host.js")).size;
console.log(`${size <= BUDGET ? "ok  " : "OVER"} accurona-host.js: ${(size / 1024).toFixed(1)} KB (budget ${BUDGET / 1024} KB)`);
console.log(`standalone build in ${out}`);
if (size > BUDGET) process.exit(1);
