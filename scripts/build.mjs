// Writes dist/: manifest.json plus one plan SVG per element (and isometric
// SVGs with --iso, which are experimental). Consumers vendor dist/.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { GROUPS, loadElements } from '../src/index.mjs';
import { footprint, planSvg } from '../src/render/plan.mjs';
import { isoSvg } from '../src/render/iso.mjs';

const withIso = process.argv.includes('--iso');
const out = new URL('../dist/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(new URL('plan/', out), { recursive: true });
if (withIso) mkdirSync(new URL('iso/', out), { recursive: true });

const elements = await loadElements();
const manifest = {
  version: 1,
  groups: GROUPS,
  elements: elements.map((el) => {
    writeFileSync(new URL(`plan/${el.id}.svg`, out), planSvg(el));
    if (withIso) writeFileSync(new URL(`iso/${el.id}.svg`, out), isoSvg(el));
    return {
      id: el.id,
      name: el.name,
      group: el.group,
      ...(el.tags?.length ? { tags: el.tags } : {}),
      size: el.size,
      ...(el.mount != null ? { mount: el.mount } : {}),
      footprint: footprint(el),
      ...(el.symbol ? { symbol: true } : {})
    };
  })
};
writeFileSync(
  new URL('manifest.json', out),
  JSON.stringify(manifest, null, 2) + '\n'
);
console.log(
  `${manifest.elements.length} elements in ${GROUPS.length} groups → dist/`
);
