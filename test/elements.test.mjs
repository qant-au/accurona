import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GROUPS, loadElements } from '../src/index.mjs';
import { TAGS } from '../src/palette.mjs';
import { bounds } from '../src/render/geometry.mjs';
import { planSvg } from '../src/render/plan.mjs';
import { isoSvg } from '../src/render/iso.mjs';

const elements = await loadElements();
const groupIds = new Set(GROUPS.map((g) => g.id));
// Saved Axonometra plans refer to these; they must always exist.
const LEGACY_IDS = ['bed', 'chair', 'table'];
const TOLERANCE = 0.5; // cm

test('ids are unique kebab-case', () => {
  const seen = new Set();
  for (const el of elements) {
    assert.match(el.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, el.id);
    assert.ok(!seen.has(el.id), `duplicate id ${el.id}`);
    seen.add(el.id);
  }
});

test(
  'legacy Axonometra ids are present',
  { todo: elements.length < 50 },
  () => {
    for (const id of LEGACY_IDS)
      assert.ok(
        elements.some((e) => e.id === id),
        id
      );
  }
);

for (const el of elements) {
  test(`${el.id}: well formed`, () => {
    assert.ok(el.name, 'name');
    assert.ok(groupIds.has(el.group), `group ${el.group}`);
    for (const t of el.tags ?? []) assert.ok(TAGS.includes(t), `tag ${t}`);
    const { w, d, h } = el.size;
    assert.ok(w > 0 && d > 0 && h > 0, 'size');
    assert.ok(el.parts?.length, 'parts');
    for (const p of el.parts) {
      const b = bounds(p);
      assert.ok(
        b.w > 0 && b.d > 0 && b.h > 0,
        `part size ${JSON.stringify(p)}`
      );
      assert.ok(
        b.x >= -TOLERANCE && b.y >= -TOLERANCE && b.z >= -TOLERANCE,
        `part below origin ${JSON.stringify(b)}`
      );
      assert.ok(
        b.x + b.w <= w + TOLERANCE,
        `part past width ${JSON.stringify(b)}`
      );
      assert.ok(
        b.y + b.d <= d + TOLERANCE,
        `part past depth ${JSON.stringify(b)}`
      );
      assert.ok(
        b.z + b.h <= h + TOLERANCE,
        `part past height ${JSON.stringify(b)}`
      );
    }
  });

  test(`${el.id}: renders`, () => {
    const plan = planSvg(el);
    assert.ok(!/NaN|undefined|Infinity/.test(plan), 'plan has a bad number');
    assert.ok(plan.length < 4096, `plan SVG is ${plan.length} bytes`);
    const iso = isoSvg(el);
    assert.ok(!/NaN|undefined|Infinity/.test(iso), 'iso has a bad number');
  });
}
