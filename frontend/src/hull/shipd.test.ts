import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { hydrostatics } from "./hydrostatics.ts";
import { bottomAt, halfAt, sheerAt } from "./sections.ts";
import { ShipD, shipdBody, shipdConstraints, shipdFeasible, SHIPD_PARAMETERS } from "./shipd.ts";

interface Reference {
  name: string;
  vector: number[];
  constraints: number[];
  pythonError?: string;
  waterlines?: { z: number; x: number[]; y: number[] }[];
  measures?: { WL: number; volume: number; waterplane: number; lcbFromBow: number; vcbFromKeel: number };
}
interface Variety {
  name: string;
  note: string;
  bodies: { vector: number[]; center?: number; aft?: number }[];
}
const fixture: { reference: Reference[]; variety: Variety[] } = JSON.parse(readFileSync(new URL("./fixtures/shipd.json", import.meta.url), "utf8"));
const rel = (a: number, b: number, tol: number, what: string) => assert.ok(Math.abs(a - b) <= tol * Math.abs(b), `${what}: ${a} not within ${tol * 100} % of ${b}`);

test("shipd: 45 parameters, 49 constraints", () => {
  assert.equal(SHIPD_PARAMETERS.length, 45);
  assert.equal(shipdConstraints(fixture.reference[0].vector)!.length, 49);
  assert.throws(() => new ShipD([1, 2, 3]), /45 numbers/);
});

test("shipd: the constraints are the original's, to rounding", () => {
  for (const r of fixture.reference) {
    const c = shipdConstraints(r.vector)!;
    c.forEach((v, i) => assert.ok(Math.abs(v - r.constraints[i]) <= 1e-9 * Math.max(1, Math.abs(r.constraints[i])), `${r.name} #${i}: ${v} ≠ ${r.constraints[i]}`));
  }
});

test("shipd: waterline half-breadths are the original's at its own points (bulbs, transoms, both stern forms)", () => {
  let checked = 0;
  for (const r of fixture.reference) {
    if (!r.waterlines) continue;
    const h = new ShipD(r.vector);
    for (const w of r.waterlines) {
      const f = h.waterline(w.z);
      w.x.forEach((x, i) => {
        const y = f(x);
        assert.ok(y !== null && Math.abs(y - w.y[i]) <= 1e-9 * h.LOA, `${r.name} z=${w.z} x=${x}: ${y} ≠ ${w.y[i]}`);
        checked++;
      });
    }
  }
  assert.ok(checked > 1500);
});

test("shipd: a vector the original cannot build fails here too", () => {
  const r = fixture.reference.find((x) => x.pythonError)!;
  assert.throws(() => shipdBody(r.vector), /singular/);
  // its constraints alone say nothing about that: feasibility is the 49 constraints, as in the original
  assert.ok(shipdFeasible(r.vector));
  assert.equal(shipdFeasible([...r.vector.slice(0, 6), 1.2, ...r.vector.slice(7)]), false, "a waterline above the deck is infeasible");
});

test("shipd: hydrostatics of the sections agree with the original's own volume measures", () => {
  for (const r of fixture.reference) {
    if (!r.measures) continue;
    const h = new ShipD(r.vector);
    const hs = hydrostatics({ bodies: [shipdBody(r.vector)] });
    rel(hs.volume, r.measures.volume, 0.01, `${r.name} volume`);
    rel(hs.waterplane, r.measures.waterplane, 0.005, `${r.name} waterplane`);
    // the original measures along the length from the bow and heights from the keel
    rel(h.LOA - hs.lcb, r.measures.lcbFromBow, 0.01, `${r.name} LCB`);
    rel(hs.vcb + h.WL, r.measures.vcbFromKeel, 0.01, `${r.name} VCB`);
  }
});

test("shipd: just below the waterline a bulbous bow no longer pinches the waterline to the bulb's width", () => {
  // sample hull 0 (a container ship): the original's fillet root lands aft of the bow taper in the top 0.5 % of the draft
  const h = new ShipD(fixture.reference.find((r) => r.name === "sample-0")!.vector);
  const z = 0.999 * h.WL;
  assert.equal(h.bowFilletHolds(z), false);
  const x = (h.waterlineRange(z)[0] + h.delta_bow(z)) / 2;
  const at = h.waterline(z)(x)!;
  const above = h.waterline(h.WL)(x)!;
  assert.ok(at > 0.9 * above, `${at} pinched against ${above}`);
});

test("shipd: the body runs stern to bow, sections bottom to top, waterline at y = 0", () => {
  const r = fixture.reference.find((x) => x.name === "sample-6")!;
  const h = new ShipD(r.vector);
  const body = shipdBody(r.vector);
  for (let i = 1; i < body.sections.length; i++) assert.ok(body.sections[i].x > body.sections[i - 1].x);
  for (const s of body.sections) for (let i = 1; i < s.points.length; i++) assert.ok(s.points[i][0] >= s.points[i - 1][0]);
  // amidships: the keel at minus the draft, the deck at depth less draft, the half-breadth of the midship section
  const mid = h.LOA / 2;
  assert.ok(Math.abs(bottomAt(body, mid)! + h.WL) < 1e-3 * h.Dd);
  assert.ok(Math.abs(sheerAt(body, mid)! - (h.Dd - h.WL)) < 1e-9);
  assert.ok(Math.abs(halfAt(body, mid, 0)! - h.halfBeam_MidBody(h.WL)) < 1e-3 * h.Bd);
});

// The variety set: the dataset's sample hulls adapted to real kinds of hull at their real sizes. Each must be
// feasible and come out at a displacement in the range a real boat or ship of that kind has.
const DISPLACEMENT: Record<string, [number, number]> = {
  "runabout-4.5m": [0.3, 1.2],
  "rib-6.5m": [0.8, 3],
  "planing-cruiser-12m": [8, 20],
  "trawler-14m": [20, 45],
  "sailing-yacht-10m": [3, 8],
  "container-ship-300m": [90000, 170000],
  "tanker-250m": [90000, 170000],
  "ddg-1000-186m": [12000, 25000],
  "lcs-freedom-118m": [2500, 6000],
  "lcs-model-1.18m": [0.0025, 0.006],
  "double-ender-8m": [4, 10],
  "sailing-barge-25m": [60, 160],
  "catamaran-12m": [6, 16],
  "lcs-independence-127m": [2000, 5000],
  "submarine-shipd-attempt": [500, 1500],
  "ocean-racer-18m": [5, 12],
  "three-master-52m": [800, 2500],
  "coastguard-cutter-127m": [3500, 7000],
  "patrol-boat-26.5m": [60, 180],
  "police-launch-11m": [4, 12],
  "aircraft-carrier-333m": [70000, 130000],
  "frigate-136m": [3000, 5500],
  "missile-boat-39m": [150, 400],
  "ddg-1000-wave-piercer-186m": [12000, 25000],
};

test("shipd: a positive bow-rise term sets the stem back as it rises: a wave-piercing bow", () => {
  const v = fixture.variety.find((x) => x.name === "ddg-1000-wave-piercer-186m")!.bodies[0].vector;
  const h = new ShipD(v);
  // the original's x runs aft from the bow: the stem at the deck lies aft of the stem at the waterline
  assert.ok(h.bow_profile(h.Dd) > h.bow_profile(h.WL) + 5, `${h.bow_profile(h.Dd)} vs ${h.bow_profile(h.WL)}`);
  const plain = new ShipD(fixture.variety.find((x) => x.name === "ddg-1000-186m")!.bodies[0].vector);
  assert.ok(plain.bow_profile(plain.Dd) <= plain.bow_profile(plain.WL));
});

test("shipd: a variety of real hulls is feasible and floats at a displacement of its kind", () => {
  assert.deepEqual(fixture.variety.map((v) => v.name).sort(), Object.keys(DISPLACEMENT).sort());
  for (const v of fixture.variety) {
    for (const b of v.bodies) assert.ok(shipdFeasible(b.vector), `${v.name} is infeasible`);
    const hull = { bodies: v.bodies.map((b) => shipdBody(b.vector, { center: b.center, aft: b.aft })) };
    const hs = hydrostatics(hull);
    const [lo, hi] = DISPLACEMENT[v.name];
    assert.ok(hs.displacement >= lo && hs.displacement <= hi, `${v.name}: ${hs.displacement.toFixed(3)} t outside ${lo} to ${hi}`);
    assert.ok(hs.vcb < 0 && hs.bmT > 0, `${v.name}: centre of buoyancy below the water, a positive metacentric radius`);
  }
});

test("shipd: a hull scales with its length; a 1:100 model displaces a millionth", () => {
  const ship = fixture.variety.find((v) => v.name === "lcs-freedom-118m")!.bodies[0].vector;
  const model = fixture.variety.find((v) => v.name === "lcs-model-1.18m")!.bodies[0].vector;
  const a = hydrostatics({ bodies: [shipdBody(ship)] });
  const b = hydrostatics({ bodies: [shipdBody(model)] });
  rel(b.volume * 1e6, a.volume, 1e-6, "volume");
  rel(b.waterplane * 1e4, a.waterplane, 1e-6, "waterplane");
});

test("shipd: multihulls are bodies side by side, their volumes adding up", () => {
  const cat = fixture.variety.find((v) => v.name === "catamaran-12m")!;
  const demi = hydrostatics({ bodies: [shipdBody(cat.bodies[0].vector)] });
  const both = hydrostatics({ bodies: cat.bodies.map((b) => shipdBody(b.vector, { center: b.center })) });
  rel(both.volume, 2 * demi.volume, 1e-9, "catamaran volume");
  assert.ok(both.bmT > 5 * demi.bmT, "far stiffer across than one demihull");
  const tri = fixture.variety.find((v) => v.name === "lcs-independence-127m")!;
  const parts = tri.bodies.map((b) => hydrostatics({ bodies: [shipdBody(b.vector, { center: b.center, aft: b.aft })] }).volume);
  const whole = hydrostatics({ bodies: tri.bodies.map((b) => shipdBody(b.vector, { center: b.center, aft: b.aft })) });
  rel(whole.volume, parts.reduce((s, v) => s + v, 0), 1e-9, "trimaran volume");
  assert.ok(Math.abs(whole.lcf - whole.lcb) < 0.2 * 127);
});
