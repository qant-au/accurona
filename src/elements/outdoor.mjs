// Outdoor and small buildings.

const r2 = (n) => Math.round(n * 100) / 100;

/** Points round a centre, clockwise on the plan (y down). `radius(t)` gives the radius at angle t. */
function ring(cx, cy, n, radius, from = 0) {
  return Array.from({ length: n }, (_, i) => {
    const t = from + (2 * Math.PI * i) / n;
    const r = radius(t);
    return [r2(cx + r * Math.cos(t)), r2(cy + r * Math.sin(t))];
  });
}

/** A thin bar from p0 to p1 as a clockwise polygon, for arms and rails at an angle. */
function bar([x0, y0], [x1, y1], hw) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const nx = (-(y1 - y0) / len) * hw;
  const ny = ((x1 - x0) / len) * hw;
  const p = [
    [x0 - nx, y0 - ny],
    [x1 - nx, y1 - ny],
    [x1 + nx, y1 + ny],
    [x0 + nx, y0 + ny]
  ].map(([x, y]) => [r2(x), r2(y)]);
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = p[i];
    const [bx, by] = p[(i + 1) % 4];
    a += ax * by - bx * ay;
  }
  return a > 0 ? p : p.reverse();
}

// Timber slats as lines across a top face, every `pitch` cm down its depth.
const slats = (w, d, pitch, inset = 0) =>
  Array.from({ length: Math.floor((d - 1) / pitch) }, (_, i) => ({
    line: [[inset, (i + 1) * pitch], [w - inset, (i + 1) * pitch]]
  }));

// A plant canopy with a scalloped edge: `lobes` bumps round a circle.
const scallop = (cx, cy, r, lobes, depth) =>
  ring(cx, cy, lobes * 6, (t) => r - depth * Math.abs(Math.sin((lobes * t) / 2)) ** 0.6);

const tree = {
  id: 'tree',
  name: 'Tree',
  group: 'outdoor',
  size: { w: 400, d: 400, h: 600 },
  parts: [
    {
      cyl: [200, 200, 200], z: 250, h: 350, role: 'plant',
      top: [
        ...Array.from({ length: 8 }, (_, i) => {
          const t = (i * Math.PI) / 4 + Math.PI / 8;
          return {
            line: [
              [r2(200 + 45 * Math.cos(t)), r2(200 + 45 * Math.sin(t))],
              [r2(200 + 165 * Math.cos(t)), r2(200 + 165 * Math.sin(t))]
            ]
          };
        }),
        { circle: [200, 200, 180], dash: '10 8' },
        { circle: [200, 200, 16], fill: 'wood' }
      ]
    },
    { cyl: [200, 200, 20], z: 0, h: 250, role: 'wood' }
  ]
};

const shrub = {
  id: 'shrub',
  name: 'Shrub',
  group: 'outdoor',
  size: { w: 100, d: 100, h: 100 },
  parts: [
    {
      poly: scallop(50, 50, 50, 9, 7), z: 15, h: 85, role: 'plant',
      top: [
        { circle: [50, 50, 3], fill: 'wood' },
        ...Array.from({ length: 5 }, (_, i) => {
          const t = (i * 2 * Math.PI) / 5;
          return { line: [[r2(50 + 10 * Math.cos(t)), r2(50 + 10 * Math.sin(t))], [r2(50 + 28 * Math.cos(t)), r2(50 + 28 * Math.sin(t))]] };
        })
      ]
    },
    { cyl: [50, 50, 5], z: 0, h: 15, role: 'wood' }
  ]
};

// Market umbrella: an octagonal canopy with its ribs, over a pole and base.
const umbrella = {
  id: 'umbrella',
  name: 'Market umbrella',
  group: 'outdoor',
  size: { w: 270, d: 270, h: 250 },
  parts: [
    {
      poly: ring(135, 135, 8, () => 135), z: 215, h: 35, role: 'soft',
      top: [
        ...ring(135, 135, 8, () => 135).map((p) => ({ line: [[135, 135], p] })),
        { circle: [135, 135, 6], fill: 'body', stroke: 'outline' }
      ]
    },
    { cyl: [135, 135, 25], z: 0, h: 8, role: 'dark' },
    { cyl: [135, 135, 2.5], z: 8, h: 207, role: 'metal' }
  ]
};

// Rotary clothesline: centre pole, four arms to the corners, wire squares.
const clothesline = (() => {
  const c = 150;
  const arms = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => ({
    poly: bar([c + sx * 6, c + sy * 6], [c + sx * 145, c + sy * 145], 1.5),
    z: 190, h: 3, role: 'metal', outline: true
  }));
  return {
    id: 'clothesline',
    name: 'Rotary clothesline',
    group: 'outdoor',
    size: { w: 300, d: 300, h: 200 },
    parts: [
      { cyl: [c, c, 4], z: 0, h: 185, role: 'metal' },
      { cyl: [c, c, 7], z: 185, h: 15, role: 'metal', outline: true },
      ...arms
    ],
    plan: [145, 110, 75, 40].map((s, i) => ({
      rect: [c - s, c - s, 2 * s, 2 * s],
      ...(i === 0 ? { stroke: 'outline' } : {})
    }))
  };
})();

// Car, nose to the front (bottom of the plan): body, cabin with windscreen and
// rear window, mirrors, and the tyres showing just past the body sides.
const car = (() => {
  const w = 185;
  const d = 470;
  const body = [
    [25, 2], [160, 2], [175, 10], [180, 30], [180, 440], [172, 461], [150, 469],
    [35, 469], [13, 461], [5, 440], [5, 30], [10, 10]
  ];
  const cabin = [
    [30, 112], [155, 112], [166, 132], [168, 338], [156, 350], [29, 350], [17, 338], [19, 132]
  ];
  const wheel = (x, y) => ({ x, y, z: 0, w: 20, d: 66, h: 30, role: 'dark', r: 4 });
  return {
    id: 'car',
    name: 'Car',
    group: 'outdoor',
    size: { w, d, h: 150 },
    parts: [
      {
        poly: body, z: 30, h: 65, outline: true,
        top: [
          { line: [[45, 352], [40, 440]] },
          { line: [[140, 352], [145, 440]] },
          { rect: [17, 450, 30, 8], r: 3, fill: 'glass' },
          { rect: [138, 450, 30, 8], r: 3, fill: 'glass' }
        ]
      },
      wheel(0, 48), wheel(165, 48), wheel(0, 348), wheel(165, 348),
      {
        poly: cabin, z: 95, h: 55, role: 'soft', outline: true,
        top: [
          { line: [[12, 50], [137, 50], [141, 180], [8, 180]], closed: true, fill: 'body' },
          { line: [[3, 180], [146, 180], [148, 238], [0, 238]], closed: true, fill: 'glass' },
          { line: [[11, 6], [136, 6], [140, 38], [7, 38]], closed: true, fill: 'glass' }
        ]
      },
      { x: 0, y: 316, z: 95, w: 15, d: 9, h: 9, r: 3, outline: true },
      { x: 170, y: 316, z: 95, w: 15, d: 9, h: 9, r: 3, outline: true }
    ]
  };
})();

// Bicycle, front wheel at the bottom: tyres, frame, cranks, saddle, bars.
const bicycle = {
  id: 'bicycle',
  name: 'Bicycle',
  group: 'outdoor',
  size: { w: 60, d: 175, h: 100 },
  parts: [
    { x: 28, y: 0, z: 0, w: 4, d: 68, h: 68, role: 'dark', r: 2 },
    { x: 28, y: 107, z: 0, w: 4, d: 68, h: 68, role: 'dark', r: 2, outline: true },
    { x: 28.5, y: 68, z: 30, w: 3, d: 39, h: 40, role: 'metal' },
    { x: 20, y: 80, z: 25, w: 20, d: 4, h: 5, role: 'metal' },
    { poly: [[23, 24], [37, 24], [36, 32], [32, 48], [28, 48], [24, 32]], z: 88, h: 8, role: 'dark' },
    { x: 2, y: 118, z: 95, w: 56, d: 4, h: 5, r: 2, role: 'metal', outline: true, top: [{ rect: [0, 0, 10, 4], r: 2, fill: 'dark' }, { rect: [46, 0, 10, 4], r: 2, fill: 'dark' }] }
  ]
};

export default [
  {
    id: 'outdoor-table',
    name: 'Outdoor table',
    group: 'outdoor',
    size: { w: 180, d: 90, h: 75 },
    parts: [
      { x: 0, y: 0, z: 71, w: 180, d: 90, h: 4, r: 2, role: 'wood', top: slats(180, 90, 15, 1) },
      ...[[6, 6], [168, 6], [6, 78], [168, 78]].map(([x, y]) => ({ x, y, z: 0, w: 6, d: 6, h: 71, role: 'metal' }))
    ]
  },
  {
    id: 'outdoor-chair',
    name: 'Outdoor chair',
    group: 'outdoor',
    size: { w: 55, d: 60, h: 85 },
    parts: [
      { x: 0, y: 0, z: 0, w: 55, d: 60, h: 40, r: 2, role: 'wood', top: slats(55, 60, 10, 7).slice(1) },
      { x: 7, y: 0, z: 40, w: 41, d: 8, h: 45, r: 2, role: 'wood', outline: true },
      { x: 0, y: 0, z: 40, w: 7, d: 60, h: 25, r: 2, role: 'wood', outline: true },
      { x: 48, y: 0, z: 40, w: 7, d: 60, h: 25, r: 2, role: 'wood', outline: true }
    ]
  },
  {
    id: 'sun-lounger',
    name: 'Sun lounger',
    group: 'outdoor',
    size: { w: 70, d: 195, h: 35 },
    parts: [
      { x: 0, y: 0, z: 0, w: 70, d: 65, h: 35, r: 3, role: 'wood', top: slats(70, 65, 13, 4) },
      { x: 0, y: 65, z: 0, w: 70, d: 130, h: 30, r: 3, role: 'wood', outline: true, top: slats(70, 130, 13, 4) }
    ]
  },
  {
    id: 'bbq',
    name: 'Barbecue',
    group: 'outdoor',
    size: { w: 140, d: 60, h: 110 },
    parts: [
      {
        x: 32, y: 0, z: 0, w: 76, d: 60, h: 110, r: 4, role: 'dark',
        top: [
          { line: [[8, 14], [68, 14]], stroke: 'soft' },
          { line: [[8, 26], [68, 26]], stroke: 'soft' },
          { line: [[8, 38], [68, 38]], stroke: 'soft' },
          { rect: [10, 52, 56, 4], r: 2, fill: 'metal', stroke: 'metal' }
        ]
      },
      { x: 0, y: 8, z: 0, w: 32, d: 50, h: 90, role: 'metal', outline: true },
      {
        x: 108, y: 8, z: 0, w: 32, d: 50, h: 90, role: 'metal', outline: true,
        top: [{ circle: [16, 22, 10] }, { circle: [16, 22, 4] }]
      }
    ]
  },
  {
    id: 'outdoor-sofa',
    name: 'Outdoor sofa',
    group: 'outdoor',
    size: { w: 200, d: 85, h: 75 },
    parts: [
      { x: 0, y: 0, z: 0, w: 200, d: 85, h: 38, r: 3, role: 'wood' },
      { x: 12, y: 0, z: 38, w: 176, d: 18, h: 37, role: 'soft', r: 4 },
      { x: 0, y: 0, z: 38, w: 12, d: 85, h: 22, role: 'wood', r: 2, outline: true },
      { x: 188, y: 0, z: 38, w: 12, d: 85, h: 22, role: 'wood', r: 2, outline: true },
      { x: 13, y: 19, z: 38, w: 86.5, d: 63, h: 12, role: 'soft', r: 4 },
      { x: 100.5, y: 19, z: 38, w: 86.5, d: 63, h: 12, role: 'soft', r: 4 }
    ]
  },
  umbrella,
  {
    id: 'planter',
    name: 'Planter box',
    group: 'outdoor',
    size: { w: 100, d: 40, h: 50 },
    parts: [
      { x: 0, y: 0, z: 0, w: 100, d: 40, h: 40, role: 'wood', top: [{ rect: [4, 4, 92, 32], fill: 'ground' }] },
      ...[20, 50, 80].map((cx) => ({ cyl: [cx, 20, 13], z: 40, h: 10, role: 'plant' }))
    ]
  },
  tree,
  shrub,
  {
    id: 'water-tank',
    name: 'Water tank, 5000 L',
    group: 'outdoor',
    size: { w: 180, d: 180, h: 220 },
    parts: [
      {
        cyl: [90, 90, 90], z: 0, h: 220,
        top: [
          { circle: [90, 90, 80] },
          { circle: [90, 90, 22], fill: 'soft' },
          { circle: [140, 90, 8], fill: 'dark' }
        ]
      }
    ]
  },
  {
    id: 'hot-water-system',
    name: 'Hot water system',
    group: 'outdoor',
    size: { w: 60, d: 60, h: 170 },
    parts: [
      {
        cyl: [30, 30, 30], z: 0, h: 170, role: 'metal',
        top: [
          { circle: [30, 30, 22] },
          { circle: [30, 30, 5], fill: 'soft' },
          { rect: [26, 52, 8, 7], fill: 'dark' }
        ]
      }
    ]
  },
  {
    id: 'heat-pump',
    name: 'Heat pump water heater',
    group: 'outdoor',
    size: { w: 60, d: 60, h: 190 },
    parts: [
      { cyl: [30, 30, 30], z: 0, h: 150, role: 'metal' },
      {
        cyl: [30, 30, 29], z: 150, h: 40, role: 'dark', outline: true,
        top: [
          { circle: [29, 29, 20], stroke: 'soft' },
          { circle: [29, 29, 13], stroke: 'soft' },
          { line: [[9, 29], [49, 29]], stroke: 'soft' },
          { line: [[29, 9], [29, 49]], stroke: 'soft' }
        ]
      }
    ]
  },
  {
    id: 'solar-inverter',
    name: 'Solar inverter',
    group: 'outdoor',
    tags: ['power'],
    size: { w: 45, d: 20, h: 60 },
    mount: 120,
    parts: [
      {
        x: 0, y: 0, z: 0, w: 45, d: 20, h: 60, r: 2,
        top: [
          { line: [[4, 5], [41, 5]], view: 'plan' },
          { line: [[4, 9], [41, 9]], view: 'plan' },
          { rect: [16, 15, 13, 2.5], accent: 'power', view: 'plan' }
        ],
        front: [{ rect: [16, 8, 13, 4], fill: 'dark' }, { rect: [20, 15, 5, 2], accent: 'power' }]
      }
    ]
  },
  {
    id: 'wheelie-bin',
    name: 'Wheelie bin',
    group: 'outdoor',
    size: { w: 60, d: 75, h: 105 },
    parts: [
      { x: 0, y: 4, z: 95, w: 60, d: 71, h: 10, r: 3, role: 'dark', top: [{ line: [[4, 62], [56, 62]], stroke: 'soft' }] },
      { x: 3, y: 6, z: 25, w: 54, d: 66, h: 70, r: 3, role: 'dark' },
      { x: 3, y: 20, z: 0, w: 54, d: 52, h: 25, r: 3, role: 'dark' },
      { x: 5, y: 0, z: 85, w: 50, d: 4, h: 15, r: 2, role: 'metal', outline: true },
      { x: 3, y: 4, z: 0, w: 6, d: 16, h: 20, role: 'metal' },
      { x: 51, y: 4, z: 0, w: 6, d: 16, h: 20, role: 'metal' }
    ]
  },
  clothesline,
  car,
  bicycle,
  {
    id: 'workbench',
    name: 'Workbench',
    group: 'outdoor',
    size: { w: 180, d: 70, h: 90 },
    parts: [
      { x: 0, y: 0, z: 84, w: 180, d: 62, h: 6, role: 'wood', top: slats(180, 62, 15.5) },
      { x: 4, y: 3, z: 0, w: 172, d: 56, h: 84, role: 'metal' },
      { x: 14, y: 62, z: 72, w: 26, d: 8, h: 16, role: 'metal', outline: true, top: [{ line: [[13, 0], [13, 8]] }] }
    ]
  },
  {
    id: 'garden-shed',
    name: 'Garden shed, 2.4 × 1.8',
    group: 'outdoor',
    size: { w: 240, d: 180, h: 210 },
    parts: [
      {
        x: 0, y: 0, z: 180, w: 240, d: 172, h: 30, role: 'metal',
        top: [
          { line: [[0, 86], [240, 86]], stroke: 'outline', weight: 'outline' },
          { rect: [4, 4, 232, 164], dash: '6 5' }
        ]
      },
      { x: 4, y: 4, z: 0, w: 232, d: 166, h: 180 },
      { x: 80, y: 172, z: 0, w: 80, d: 8, h: 175, role: 'wood', outline: true, top: [{ line: [[40, 0], [40, 8]] }] }
    ]
  },
  {
    id: 'pool',
    name: 'Swimming pool',
    group: 'outdoor',
    size: { w: 700, d: 350, h: 150 },
    parts: [
      { x: 0, y: 0, z: 0, w: 700, d: 30, h: 150, role: 'ground' },
      { x: 0, y: 320, z: 0, w: 700, d: 30, h: 150, role: 'ground', outline: true },
      { x: 0, y: 30, z: 0, w: 30, d: 290, h: 150, role: 'ground', outline: true },
      { x: 670, y: 30, z: 0, w: 30, d: 290, h: 150, role: 'ground', outline: true },
      {
        x: 30, y: 30, z: 0, w: 640, d: 290, h: 140, role: 'glass',
        top: [
          { line: [[35, 0], [35, 290]] },
          { line: [[70, 0], [70, 290]] },
          { line: [[260, 120], [290, 110], [320, 120], [350, 110], [380, 120]] },
          { line: [[300, 170], [330, 160], [360, 170], [390, 160], [420, 170]] }
        ]
      }
    ]
  }
];
