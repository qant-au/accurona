// Runs against the build: npm run build first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SCENE_SCHEMA_URL,
  emptyScene,
  mergeScene,
  parseJson,
  parseScene,
  serializeScene,
  validateScene
} from '../dist/index.js';

const doc = readFileSync(
  new URL('../../../docs/scene-format.md', import.meta.url),
  'utf8'
);

// Every complete scene in the spec is valid: the prose and the schema agree.
const examples = [...doc.matchAll(/```json\n([\s\S]*?)```/g)]
  .map((m) => m[1])
  .filter((text) => text.trimStart().startsWith('{'));

test('the spec has worked examples', () => {
  assert.ok(examples.length >= 4, `found ${examples.length}`);
});

examples.forEach((text, i) => {
  test(`spec example ${i + 1} is a valid scene`, () => {
    const result = parseScene(text);
    assert.equal(result.ok, true, result.ok ? '' : result.errors.join('\n'));
  });
});

const base = () => ({
  format: 'accurona-scene',
  version: 1,
  id: 's',
  objects: [
    { id: 'a', name: 'A', ports: [{ id: 'p1' }] },
    { id: 'b', name: 'B' }
  ],
  connections: [{ id: 'c', from: 'a', fromPort: 'p1', to: 'b' }],
  views: [
    {
      id: 'd',
      kind: 'iso',
      name: 'Diagram',
      placements: [
        { object: 'a', tile: { x: 0, y: 0 } },
        { object: 'b', tile: { x: 2, y: 0 } }
      ],
      connectors: [
        {
          id: 'k',
          connection: 'c',
          anchors: [
            { id: 'k1', ref: { object: 'b' } },
            { id: 'k2', ref: { object: 'a' } }
          ]
        }
      ]
    }
  ]
});

const errorsOf = (value) => {
  const result = validateScene(value);
  assert.equal(result.ok, false, 'expected the scene to be refused');
  return result.errors.join('\n');
};

test('a scene with connected, placed objects is valid', () => {
  const result = validateScene(base());
  assert.equal(result.ok, true, result.ok ? '' : result.errors.join('\n'));
});

test('unknown keys are refused at every level', () => {
  const s = base();
  s.objects[0].colour = 'red';
  assert.match(errorsOf(s), /colour/);
});

test('ids must be safe strings', () => {
  const s = base();
  s.objects[1].id = 'has space';
  assert.match(errorsOf(s), /Ids are/);
});

test('references must resolve', () => {
  const s = base();
  s.connections[0].toPort = 'nope';
  assert.match(errorsOf(s), /no port "nope"/);
  const t = base();
  t.views[0].placements.push({ object: 'ghost', tile: { x: 1, y: 1 } });
  assert.match(errorsOf(t), /Unknown object "ghost"/);
});

test('an object is placed at most once per view', () => {
  const s = base();
  s.views[0].placements.push({ object: 'a', tile: { x: 5, y: 5 } });
  assert.match(errorsOf(s), /placed twice/);
});

test("a connector's ends must match its connection", () => {
  const s = base();
  s.objects.push({ id: 'z' });
  s.views[0].placements.push({ object: 'z', tile: { x: 4, y: 4 } });
  s.views[0].connectors[0].anchors[0].ref = { object: 'z' };
  assert.match(errorsOf(s), /do not match connection/);
});

test('groups may not nest in a cycle', () => {
  const s = base();
  s.views[0].groups = [
    { id: 'g1', group: 'g2' },
    { id: 'g2', group: 'g1' }
  ];
  assert.match(errorsOf(s), /inside itself/);
});

test('link and icon urls are restricted', () => {
  const s = base();
  s.objects[0].links = [{ source: 'rmm', url: 'javascript:alert(1)' }];
  assert.match(errorsOf(s), /http: or https:/);
  const t = base();
  t.icons = [{ id: 'i', name: 'I', url: 'data:text/html,x' }];
  t.objects[0].icon = 'i';
  assert.match(errorsOf(t), /icon url/);
});

test('a newer version is refused, not half-read', () => {
  const s = base();
  s.version = 2;
  assert.match(errorsOf(s), /newer than this editor reads/);
});

test('parseJson drops prototype keys', () => {
  const value = parseJson('{"__proto__":{"polluted":true},"a":1}');
  assert.equal({}.polluted, undefined);
  assert.deepEqual(Object.keys(value), ['a']);
});

test('serializeScene writes $schema first and refuses an invalid scene', () => {
  const text = serializeScene(emptyScene('x', 'X'));
  const parsed = JSON.parse(text);
  assert.deepEqual(Object.keys(parsed).slice(0, 4), [
    '$schema',
    'format',
    'version',
    'id'
  ]);
  assert.equal(parsed.$schema, SCENE_SCHEMA_URL);
  const bad = base();
  bad.objects.push({ id: 'a' });
  assert.throws(() => serializeScene(bad), /invalid scene/);
});

// A plan view, owned by Axonometra, beside Reticulyne's diagram.
const shared = () => {
  const s = base();
  s.objects.push({ id: 'sofa', element: 'sofa-3', props: { colour: 'grey' } });
  s.views.push({
    id: 'plan',
    kind: 'plan',
    name: 'Plan',
    floors: [{ id: 'g', nodes: [], walls: [] }],
    placements: [
      { object: 'a', floor: 'g', x: 0, y: 0, layer: 'l1' },
      { object: 'sofa', floor: 'g', x: 100, y: 100 }
    ]
  });
  s.layers = [{ id: 'l1', name: 'Kit' }];
  return s;
};

test('merge keeps views and object fields the editor does not own', () => {
  const opened = shared();
  // Reticulyne renames A and moves it; it knows nothing of the plan.
  const merged = mergeScene(opened, {
    viewKinds: ['iso', 'schematic'],
    views: [
      {
        id: 'd',
        kind: 'iso',
        name: 'Diagram',
        placements: [
          { object: 'a', tile: { x: 1, y: 1 } },
          { object: 'b', tile: { x: 2, y: 0 } }
        ],
        connectors: [
          {
            id: 'k',
            anchors: [
              { id: 'k1', ref: { object: 'b' } },
              { id: 'k2', ref: { object: 'a' } }
            ]
          }
        ]
      }
    ],
    objects: [
      { id: 'a', name: 'A2' },
      { id: 'b', name: 'B' }
    ],
    objectFields: ['name', 'description', 'icon'],
    preserve: { connector: ['connection', 'layer'] }
  });
  assert.equal(validateScene(merged).ok, true);
  const a = merged.objects.find((o) => o.id === 'a');
  assert.equal(a.name, 'A2');
  assert.deepEqual(a.ports, [{ id: 'p1' }]);
  assert.ok(merged.objects.some((o) => o.id === 'sofa'));
  assert.deepEqual(
    merged.views.map((v) => v.id),
    ['d', 'plan']
  );
  assert.equal(merged.views[0].connectors[0].connection, 'c');
  assert.equal(merged.connections.length, 1);
});

test('merge deletes an object the editor removed, unless placed elsewhere', () => {
  const opened = shared();
  // Axonometra deletes the sofa and A from its plan.
  const merged = mergeScene(opened, {
    viewKinds: ['plan'],
    views: [
      {
        id: 'plan',
        kind: 'plan',
        name: 'Plan',
        floors: [{ id: 'g', nodes: [], walls: [] }],
        placements: []
      }
    ],
    objects: [],
    objectFields: ['element']
  });
  assert.equal(validateScene(merged).ok, true);
  const ids = merged.objects.map((o) => o.id);
  assert.ok(!ids.includes('sofa'), 'sofa was only on the plan');
  assert.ok(ids.includes('a'), 'A is still in the diagram');
});

test('merge keeps objects no editor has placed', () => {
  const opened = emptyScene('n');
  opened.objects = [{ id: 'fw', element: 'firewall' }];
  const merged = mergeScene(opened, {
    viewKinds: ['plan'],
    views: [],
    objects: [],
    objectFields: ['element']
  });
  assert.deepEqual(merged.objects, [{ id: 'fw', element: 'firewall' }]);
});

test('merge drops connections to deleted objects and their connector links', () => {
  const opened = base();
  const merged = mergeScene(opened, {
    viewKinds: ['iso'],
    views: [
      {
        id: 'd',
        kind: 'iso',
        name: 'Diagram',
        placements: [{ object: 'a', tile: { x: 0, y: 0 } }]
      }
    ],
    objects: [{ id: 'a', name: 'A' }],
    objectFields: ['name', 'description', 'icon']
  });
  assert.equal(validateScene(merged).ok, true);
  assert.deepEqual(merged.connections, []);
});
