// Kitchen.
//
// Under-bench units share one build: a recessed plinth, a carcass 58 deep and a
// 30 mm benchtop 60 deep, top at 90. Sinks and cooktops are base cabinets with
// something on or in the benchtop. Tall and overhead units are plain boxes.

const KICK = 10; // plinth height
const CARCASS_D = 58;
const TOP = 3; // benchtop thickness

// Door fronts on a carcass face: `n` doors side by side, handles near the top.
function doorFronts(w, h, n) {
  const dw = w / n;
  return Array.from({ length: n }, (_, i) => [
    { rect: [i * dw + 1, 1, dw - 2, h - 2] },
    { line: [[i * dw + (i % 2 ? 4 : dw - 4), 5], [i * dw + (i % 2 ? 4 : dw - 4), 13]], stroke: 'outline' }
  ]).flat();
}

// Plinth, carcass and benchtop. `benchZ` lets a cooktop sit on top of the bench
// without the element growing past 90. `top` decals go on the benchtop.
function underBench({ w, doors, top = [], benchZ = 90 - TOP, fronts }) {
  const ch = benchZ - KICK;
  // Benchtop first: the first part gets the heavy outline, inset to stay inside the footprint.
  return [
    { x: 0, y: 0, z: benchZ, w, d: 60, h: TOP, role: 'soft', top },
    { x: 0, y: 0, z: KICK, w, d: CARCASS_D, h: ch, front: fronts ?? doorFronts(w, ch, doors) },
    { x: 0, y: 0, z: 0, w, d: CARCASS_D - 5, h: KICK, role: 'soft' }
  ];
}

// The carcass face under the benchtop, dashed: says "cupboard below" on a plan.
const faceLine = (w, x0 = 0) => ({ line: [[x0 + 2, CARCASS_D], [x0 + w - 2, CARCASS_D]], dash: '3 2', view: 'plan' });

function baseCabinet({ id, name, w }) {
  const doors = w > 60 ? 2 : 1;
  return {
    id,
    name,
    group: 'kitchen',
    size: { w, d: 60, h: 90 },
    parts: underBench({
      w,
      doors,
      top: [faceLine(w)]
    })
  };
}

// A tap: base on the benchtop behind the bowl, spout reaching over it.
const tap = (x, y, reach) => [
  { circle: [x, y, 2], fill: 'metal', stroke: 'outline' },
  { line: [[x, y + 2], [x, y + reach]], stroke: 'outline' }
];

// A sink: `bowls` side by side (widths in cm), stainless, each with a drain.
function sink({ id, name, w, bowls, ceramic = false }) {
  const gap = 4;
  const bw = bowls.reduce((a, b) => a + b, 0) + gap * (bowls.length - 1);
  let x = (w - bw) / 2;
  const marks = [];
  const y = ceramic ? 11 : 13;
  const bd = ceramic ? 45 : 40;
  if (ceramic) marks.push({ rect: [x - 3, y - 3, bw + 6, bd + 6], r: 5, fill: 'body', stroke: 'outline' });
  for (const b of bowls) {
    marks.push(
      { rect: [x, y, b, bd], r: 4, fill: 'glass', stroke: ceramic ? 'detail' : 'outline' },
      { circle: [x + b / 2, y + bd / 2, 2.5], fill: 'body' }
    );
    x += b + gap;
  }
  const tx = bowls.length > 1 ? (w - bw) / 2 + bowls[0] + gap / 2 : w / 2;
  return {
    id,
    name,
    group: 'kitchen',
    size: { w, d: 60, h: 90 },
    parts: underBench({ w, doors: w > 60 ? 2 : 1, top: [...marks, ...tap(tx, 5, bowls.length > 1 ? 14 : 12)] })
  };
}

// A burner: flame ring and a dark cap.
const burner = (x, y, r) => [
  { circle: [x, y, r], stroke: 'outline' },
  { circle: [x, y, r * 0.45], fill: 'dark' }
];

// A gas hob plate: burners as [x, y, r] in plate cm, one knob per burner along the front.
function hobPlate(w, d, burners) {
  const kx = (i) => w / 2 + (i - (burners.length - 1) / 2) * 7;
  return [
    ...burners.flatMap(([x, y, r]) => burner(x, y, r)),
    ...burners.map((_, i) => ({ circle: [kx(i), d - 4, 1.8], fill: 'dark' }))
  ];
}

function cooktop({ id, name, w, burners }) {
  const pw = w - 4;
  return {
    id,
    name,
    group: 'kitchen',
    size: { w, d: 60, h: 90 },
    parts: [
      ...underBench({ w, doors: w > 60 ? 2 : 1, benchZ: 90 - TOP - 1 }),
      { x: 2, y: 4, z: 89, w: pw, d: 52, h: 1, role: 'metal', outline: true, r: 1, top: hobPlate(pw, 52, burners) }
    ]
  };
}

// A full-height cupboard: tall box with the diagonal cross plans use for tall units.
export function tallCupboard({ id, name, group, w, d, h, extra = [], front = [] }) {
  return {
    id,
    name,
    group,
    size: { w, d, h },
    parts: [
      {
        x: 0, y: 0, z: 0, w, d, h,
        top: [{ line: [[0, 0], [w, d]], view: 'plan' }, { line: [[w, 0], [0, d]], view: 'plan' }, ...extra],
        front
      }
    ]
  };
}

export default [
  baseCabinet({ id: 'base-cabinet-600', name: 'Base cabinet 600', w: 60 }),
  baseCabinet({ id: 'base-cabinet-900', name: 'Base cabinet 900', w: 90 }),
  {
    id: 'corner-cabinet',
    name: 'Corner base cabinet',
    group: 'kitchen',
    size: { w: 90, d: 90, h: 90 },
    // Walls at the top and the left; the L opens to the bottom right.
    parts: [
      {
        poly: [[0.75, 0.75], [89.25, 0.75], [89.25, 59.25], [59.25, 59.25], [59.25, 89.25], [0.75, 89.25]], z: 87, h: TOP, role: 'soft',
        top: [{ line: [[87.25, 57.25], [57.25, 57.25], [57.25, 87.25]], dash: '3 2', view: 'plan' }]
      },
      { poly: [[0, 0], [90, 0], [90, 58], [58, 58], [58, 90], [0, 90]], z: KICK, h: 77 },
      { poly: [[0, 0], [90, 0], [90, 53], [53, 53], [53, 90], [0, 90]], z: 0, h: KICK, role: 'soft' }
    ]
  },
  {
    id: 'wall-cabinet-600',
    name: 'Wall cabinet 600',
    group: 'kitchen',
    size: { w: 60, d: 35, h: 70 },
    mount: 145,
    // Overhead: dashed cross, the plan convention for units above the cut line.
    parts: [
      {
        x: 0, y: 0, z: 0, w: 60, d: 35, h: 70,
        top: [{ line: [[0, 0], [60, 35]], dash: '3 2', view: 'plan' }, { line: [[60, 0], [0, 35]], dash: '3 2', view: 'plan' }],
        front: doorFronts(60, 70, 1).map((dc) => (dc.line ? { ...dc, line: [[56, 57], [56, 65]] } : dc))
      }
    ]
  },
  tallCupboard({
    id: 'pantry', name: 'Pantry cupboard', group: 'kitchen', w: 60, d: 60, h: 220,
    front: [{ rect: [1, 1, 58, 218] }, { line: [[55, 100], [55, 125]], stroke: 'outline' }]
  }),
  sink({ id: 'sink-single', name: 'Sink, single bowl', w: 60, bowls: [44] }),
  sink({ id: 'sink-double', name: 'Sink, double bowl', w: 120, bowls: [44, 44] }),
  sink({ id: 'butler-sink', name: "Butler's sink", w: 80, bowls: [62], ceramic: true }),
  cooktop({ id: 'cooktop', name: 'Cooktop, 4 burner', w: 60, burners: [[14, 14, 8], [42, 14, 6], [14, 36, 6], [42, 36, 7]] }),
  cooktop({ id: 'cooktop-5', name: 'Cooktop, 5 burner', w: 90, burners: [[15, 14, 7], [15, 36, 6], [43, 25, 10], [71, 14, 6], [71, 36, 7]] }),
  {
    id: 'oven-freestanding',
    name: 'Freestanding oven',
    group: 'kitchen',
    size: { w: 60, d: 60, h: 90 },
    parts: [
      {
        x: 0, y: 0, z: 0, w: 60, d: 60, h: 88, role: 'metal', r: 1,
        top: [{ line: [[1, 54], [59, 54]], view: 'plan' }],
        front: [{ rect: [4, 18, 52, 50], r: 2, fill: 'dark' }, { line: [[8, 21], [52, 21]], stroke: 'outline' }, ...[12, 24, 36, 48].map((x) => ({ circle: [x, 8, 2], fill: 'dark' }))]
      },
      { x: 1, y: 1, z: 88, w: 58, d: 52, h: 2, role: 'dark', outline: true, top: [[14, 14, 8], [42, 14, 6], [14, 37, 6], [42, 37, 7]].map(([x, y, r]) => ({ circle: [x, y, r], stroke: 'soft' })) }
    ],
    plan: [12, 24, 36, 48].map((x) => ({ circle: [x, 57, 1.8], fill: 'dark' }))
  },
  tallCupboard({
    id: 'wall-oven', name: 'Wall oven tower', group: 'kitchen', w: 60, d: 60, h: 220,
    extra: [{ line: [[4, 3], [56, 3], [56, 57], [4, 57]], closed: true, dash: '3 2', view: 'plan' }],
    front: [
      { rect: [1, 1, 58, 60] },
      { rect: [1, 63, 58, 60], fill: 'metal' },
      { rect: [7, 75, 46, 40], r: 2, fill: 'dark' },
      { line: [[8, 68], [52, 68]], stroke: 'outline' },
      { rect: [1, 125, 58, 45] },
      { rect: [1, 172, 58, 37] }
    ]
  }),
  {
    id: 'rangehood',
    name: 'Rangehood',
    group: 'kitchen',
    size: { w: 90, d: 50, h: 60 },
    mount: 160,
    // Canopy and chimney. Ridges from the chimney to the canopy corners read as
    // a hood from above; dashed like every other overhead unit's cross.
    parts: [
      {
        x: 0, y: 0, z: 0, w: 90, d: 50, h: 8, role: 'metal',
        top: [
          { line: [[33, 25], [0, 50]], dash: '3 2', view: 'plan' },
          { line: [[57, 25], [90, 50]], dash: '3 2', view: 'plan' },
          { line: [[33, 0], [0, 0]], view: 'iso' }
        ],
        front: [{ rect: [70, 3, 14, 2], fill: 'dark' }]
      },
      { x: 33, y: 0.75, z: 8, w: 24, d: 24.25, h: 52, role: 'metal', outline: true }
    ]
  },
  {
    id: 'fridge',
    name: 'Fridge',
    group: 'kitchen',
    size: { w: 70, d: 70, h: 180 },
    parts: [
      { x: 0, y: 0, z: 0, w: 70, d: 64, h: 180, r: 2, top: [{ line: [[6, 4], [64, 4]], view: 'plan' }, { line: [[6, 7], [64, 7]], view: 'plan' }] },
      {
        x: 0.75, y: 64, z: 1, w: 68.5, d: 4.25, h: 178, outline: true,
        front: [{ line: [[0, 58], [70, 58]] }, { line: [[64, 5], [64, 50]], stroke: 'outline' }, { line: [[64, 66], [64, 110]], stroke: 'outline' }]
      },
      { x: 62, y: 68.25, z: 60, w: 4, d: 1.5, h: 90, role: 'metal' }
    ]
  },
  {
    id: 'fridge-french',
    name: 'Fridge, French door',
    group: 'kitchen',
    size: { w: 90, d: 75, h: 180 },
    parts: [
      { x: 0, y: 0, z: 0, w: 90, d: 69, h: 180, r: 2, top: [{ line: [[6, 4], [84, 4]], view: 'plan' }, { line: [[6, 7], [84, 7]], view: 'plan' }] },
      { x: 0.75, y: 69, z: 60, w: 43.75, d: 4.25, h: 119, outline: true },
      { x: 45.5, y: 69, z: 60, w: 43.75, d: 4.25, h: 119, outline: true },
      { x: 0.75, y: 69, z: 1, w: 88.5, d: 4.25, h: 58, outline: true, front: [{ line: [[10, 5], [80, 5]], stroke: 'outline' }] },
      { x: 39, y: 73.25, z: 90, w: 3, d: 1.5, h: 70, role: 'metal' },
      { x: 48, y: 73.25, z: 90, w: 3, d: 1.5, h: 70, role: 'metal' }
    ]
  },
  {
    id: 'dishwasher',
    name: 'Dishwasher',
    group: 'kitchen',
    size: { w: 60, d: 60, h: 85 },
    // Under-bench: the benchtop over it is the neighbouring run's. Racks dashed
    // inside, stainless door at the front.
    parts: [
      {
        x: 0, y: 0, z: 0, w: 60, d: 56, h: 85,
        top: [{ rect: [5, 5, 50, 20], dash: '3 2', view: 'plan' }, { rect: [5, 29, 50, 22], dash: '3 2', view: 'plan' }]
      },
      {
        x: 0.75, y: 56, z: 8, w: 58.5, d: 3.25, h: 77, role: 'metal', outline: true,
        top: [{ rect: [40, 1, 14, 2], fill: 'dark', stroke: 'dark' }],
        front: [{ line: [[8, 6], [52, 6]], stroke: 'outline' }]
      }
    ]
  },
  {
    id: 'microwave',
    name: 'Microwave',
    group: 'kitchen',
    size: { w: 50, d: 40, h: 30 },
    mount: 90,
    parts: [
      {
        x: 0, y: 0, z: 0, w: 50, d: 37, h: 30, r: 1,
        top: [{ line: [[3, 5], [30, 5]], view: 'plan' }, { line: [[3, 9], [30, 9]], view: 'plan' }, { line: [[3, 13], [30, 13]], view: 'plan' }]
      },
      {
        x: 0.5, y: 37, z: 0, w: 49, d: 2.5, h: 30, role: 'dark', outline: true,
        front: [{ rect: [4, 4, 30, 22], r: 1, fill: 'glass', stroke: 'soft' }, { rect: [38, 4, 9, 22], stroke: 'soft' }]
      }
    ]
  },
  {
    id: 'island-bench',
    name: 'Island bench',
    group: 'kitchen',
    size: { w: 240, d: 100, h: 90 },
    // Cupboards open to the front; the benchtop overhangs 35 at the back for stools.
    parts: [
      {
        x: 0, y: 0, z: 87, w: 240, d: 100, h: TOP, role: 'soft',
        top: [{ line: [[2, 35], [238, 35], [238, 98], [2, 98]], closed: true, dash: '3 2', view: 'plan' }]
      },
      { x: 0, y: 35, z: KICK, w: 240, d: 63, h: 77, front: doorFronts(240, 77, 4) },
      { x: 5, y: 40, z: 0, w: 230, d: 53, h: KICK, role: 'soft' }
    ]
  },
  {
    id: 'breakfast-bar',
    name: 'Breakfast bar',
    group: 'kitchen',
    size: { w: 180, d: 50, h: 105 },
    // A raised top on a back panel; stools pull up at the front.
    parts: [
      { x: 0, y: 0, z: 102, w: 180, d: 50, h: TOP, role: 'wood', r: 1, top: [{ line: [[2, 12], [178, 12]], dash: '3 2', view: 'plan' }] },
      { x: 0, y: 0, z: 0, w: 180, d: 12, h: 102 }
    ]
  },
  {
    id: 'kitchen-bin',
    name: 'Kitchen bin',
    group: 'kitchen',
    size: { w: 40, d: 35, h: 65 },
    // Pedal bin: lid hinged at the back, pedal at the front.
    parts: [
      { x: 0, y: 0, z: 60, w: 40, d: 32, h: 5, role: 'metal', r: 5, top: [{ line: [[4, 5], [36, 5]] }] },
      { x: 0, y: 0, z: 0, w: 40, d: 32, h: 60, role: 'metal', r: 5 },
      { x: 12, y: 32, z: 0, w: 16, d: 3, h: 3, role: 'dark' }
    ]
  }
];
