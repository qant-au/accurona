import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrostatics, SEA_WATER } from "./hydrostatics.ts";
import type { Hull, HullBody, Section } from "./types.ts";

const rel = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol * Math.abs(b), `${a} not within ${tol * 100} % of ${b}`);

const L = 10;
const B = 3;
const T = 1;
const F = 1;

const stations = (n: number, at: (x: number) => Section["points"]): Section[] =>
  Array.from({ length: n }, (_, i) => {
    const x = (L * i) / (n - 1);
    return { x, points: at(x) };
  });

test("hydrostatics: a box barge matches its closed forms", () => {
  const box: Hull = { bodies: [{ center: 0, sections: stations(2, () => [[-T, B / 2], [F, B / 2]]) }] };
  const h = hydrostatics(box);
  rel(h.volume, L * B * T, 1e-9);
  rel(h.displacement, L * B * T * SEA_WATER, 1e-9);
  rel(h.vcb, -T / 2, 1e-9);
  rel(h.lcb, L / 2, 1e-9);
  rel(h.waterplane, L * B, 1e-9);
  rel(h.lcf, L / 2, 1e-9);
  rel(h.bmT, (B * B) / (12 * T), 1e-9);
  rel(h.bmL, (L * L) / (12 * T), 1e-9);
  rel(h.lwl, L, 1e-9);
  rel(h.bwl, B, 1e-9);
});

test("hydrostatics: a V section gives a triangle's area and centroid", () => {
  // half-breadth B/2 at the waterline, 0 at the keel; topsides carried straight up
  const v: Hull = { bodies: [{ center: 0, sections: stations(2, () => [[-T, 0], [0, B / 2], [F, B / 2]]) }] };
  const h = hydrostatics(v);
  rel(h.volume, (L * B * T) / 2, 1e-9);
  rel(h.vcb, -T / 3, 1e-9);
});

test("hydrostatics: a Wigley hull is within 0.5 % of its analytic volume and waterplane", () => {
  // z = B/2 (1 − ξ²)(1 − (y/T)²), ξ = 2x/L − 1: volume 4/9 L B T, waterplane 2/3 L B
  const levels = 13;
  const wigley: Hull = {
    bodies: [
      {
        center: 0,
        sections: stations(41, (x) => {
          const xi = (2 * x) / L - 1;
          const pts: Section["points"] = [];
          for (let j = 0; j < levels; j++) {
            const y = -T + (T * j) / (levels - 1);
            pts.push([y, (B / 2) * (1 - xi * xi) * (1 - (y / T) ** 2)]);
          }
          pts.push([F, (B / 2) * (1 - xi * xi)]);
          return pts;
        }),
      },
    ],
  };
  const h = hydrostatics(wigley);
  rel(h.volume, (4 / 9) * L * B * T, 0.005);
  rel(h.waterplane, (2 / 3) * L * B, 0.005);
  rel(h.lcb, L / 2, 1e-6);
});

test("hydrostatics: a catamaran's two hulls are twice one in volume, and stiffer across by their spacing", () => {
  const one = (center: number): HullBody => ({ center, sections: stations(2, () => [[-T, 0.5], [F, 0.5]]) });
  const single = hydrostatics({ bodies: [one(0)] });
  const cat = hydrostatics({ bodies: [one(-2), one(2)] });
  rel(cat.volume, 2 * single.volume, 1e-9);
  // each hull's own moment plus its area times the spacing squared (parallel axis)
  rel(cat.iT, 2 * (single.iT + single.waterplane * 4), 1e-9);
  rel(cat.bwl, 5, 1e-9);
});

test("hydrostatics: a lower waterline floats less of the hull, and a hull clear of the water nothing", () => {
  const box: Hull = { bodies: [{ center: 0, sections: stations(2, () => [[-T, B / 2], [F, B / 2]]) }] };
  rel(hydrostatics(box, -0.5).volume, (L * B * T) / 2, 1e-9);
  const dry = hydrostatics(box, -2);
  assert.equal(dry.volume, 0);
  assert.equal(dry.waterplane, 0);
});
