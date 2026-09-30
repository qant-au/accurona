// Runs against the build: npm run build first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  diagramLocations,
  objectPlaces,
  placedOnlyElsewhere,
  validateScene
} from '../dist/index.js';

// Two floors on one plan; a diagram per floor, and a switch on no plan.
const scene = {
  format: 'accurona-scene',
  version: 1,
  id: 'hq',
  objects: [
    { id: 'sw-1', element: 'network-switch' },
    { id: 'ap-1', element: 'wifi-ap' },
    { id: 'ap-2', element: 'wifi-ap' },
    { id: 'cam-2', element: 'camera' },
    { id: 'sofa', element: 'sofa' },
    { id: 'cloud' },
    { id: 'loose' }
  ],
  views: [
    {
      id: 'plan',
      kind: 'plan',
      name: 'Building',
      floors: [
        { id: 'g', name: 'Ground' },
        { id: 'l2', name: 'Level 2' }
      ],
      placements: [
        { object: 'sw-1', floor: 'g', x: 100, y: 200 },
        { object: 'ap-1', floor: 'g', x: 300, y: 400 },
        { object: 'ap-2', floor: 'l2', x: 500, y: 600 },
        { object: 'cam-2', floor: 'l2', x: 700, y: 800 },
        { object: 'sofa', floor: 'l2', x: 900, y: 1000 }
      ]
    },
    {
      id: 'net-g',
      kind: 'iso',
      name: 'Ground network',
      placements: [
        { object: 'sw-1', tile: { x: 0, y: 0 } },
        { object: 'ap-1', tile: { x: 2, y: 0 } },
        { object: 'cloud', tile: { x: 4, y: 0 } }
      ]
    },
    {
      id: 'net-2',
      kind: 'schematic',
      name: 'Level 2 network',
      placements: [
        { object: 'ap-2', tile: { x: 0, y: 0 } },
        { object: 'sw-1', tile: { x: 2, y: 0 } }
      ]
    }
  ]
};

test('the fixture is a valid scene', () => {
  assert.equal(validateScene(scene).ok, true);
});

test('objectPlaces lists every view an object is in, with where', () => {
  assert.deepEqual(objectPlaces(scene, 'sw-1'), [
    {
      viewId: 'plan',
      viewName: 'Building',
      kind: 'plan',
      floorId: 'g',
      floorName: 'Ground',
      x: 100,
      y: 200
    },
    {
      viewId: 'net-g',
      viewName: 'Ground network',
      kind: 'iso',
      tile: { x: 0, y: 0 }
    },
    {
      viewId: 'net-2',
      viewName: 'Level 2 network',
      kind: 'schematic',
      tile: { x: 2, y: 0 }
    }
  ]);
  assert.deepEqual(objectPlaces(scene, 'loose'), []);
  assert.deepEqual(objectPlaces(scene, 'nothing'), []);
});

test('placedOnlyElsewhere: what the other editor placed and this one has not', () => {
  const ids = (list) => list.map((o) => o.id);
  // For a diagram editor: on the plan, in no diagram. Never the unplaced.
  assert.deepEqual(ids(placedOnlyElsewhere(scene, ['iso', 'schematic'])), [
    'cam-2',
    'sofa'
  ]);
  // For a plan editor: in a diagram, on no plan.
  assert.deepEqual(ids(placedOnlyElsewhere(scene, ['plan'])), ['cloud']);
  // A diagram editor that draws only iso still counts schematic as elsewhere.
  assert.deepEqual(ids(placedOnlyElsewhere(scene, ['iso'])), [
    'ap-2',
    'cam-2',
    'sofa'
  ]);
});

test('diagramLocations maps a diagram view to the plan floors of its objects', () => {
  assert.deepEqual(diagramLocations(scene, 'net-g'), [
    {
      planViewId: 'plan',
      planViewName: 'Building',
      floorId: 'g',
      floorName: 'Ground',
      count: 2
    }
  ]);
  // Most objects first; a tie keeps floor order.
  assert.deepEqual(
    diagramLocations(scene, 'net-2').map((l) => [l.floorId, l.count]),
    [
      ['g', 1],
      ['l2', 1]
    ]
  );
  // Narrowed to some of the diagram's objects; ones not in it are ignored.
  assert.deepEqual(
    diagramLocations(scene, 'net-2', ['ap-2', 'cam-2']).map((l) => l.floorId),
    ['l2']
  );
});

test('diagramLocations: nothing for a plan view, an unknown view or no plan', () => {
  assert.deepEqual(diagramLocations(scene, 'plan'), []);
  assert.deepEqual(diagramLocations(scene, 'nope'), []);
  const noPlan = { ...scene, views: scene.views.slice(1) };
  assert.deepEqual(diagramLocations(noPlan, 'net-g'), []);
});
