// Writes schema/scene-v1.json: the JSON Schema (Draft 2020-12) generated from
// the Zod schema, published with each release so a scene can be validated in
// any language. Structure only: id references are checked by the library.
// Run after tsc (it reads dist/).
import { mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import {
  SCENE_SCHEMA_URL,
  SCENE_VERSION,
  sceneShapeSchema
} from '../dist/index.js';

const schema = z.toJSONSchema(sceneShapeSchema, {
  target: 'draft-2020-12',
  // Refinements (url schemes, a link needing a ref or url) cannot be
  // expressed; the structure they sit on still is.
  unrepresentable: 'any'
});
const out = new URL('../schema/', import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(
  new URL(`scene-v${SCENE_VERSION}.json`, out),
  JSON.stringify(
    {
      $id: SCENE_SCHEMA_URL,
      title: `Accurona scene, version ${SCENE_VERSION}`,
      ...schema
    },
    null,
    2
  ) + '\n'
);
console.log(`schema/scene-v${SCENE_VERSION}.json`);
