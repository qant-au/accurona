// Comms and server room.

/** Overall cabinet height in cm for a rack of `u` units (1U = 4.445 cm, plus plinth and roof). */
export const rackHeight = (u) => Math.round(u * 4.445 + 13);

// A closed rack cabinet: dark body, roof panel with front and rear cable
// entries, and a network-blue status strip on the front edge so the door side
// reads on a plan.
function rack({ id, name, w, d, u, mount, sizeLabel }) {
  const h = rackHeight(u);
  const slots = Math.max(3, Math.round(u / 7));
  const pitch = (h - 20) / slots;
  return {
    id,
    name: `${name} ${u}U, ${sizeLabel}`,
    group: 'comms',
    tags: ['network'],
    size: { w, d, h },
    ...(mount ? { mount } : {}),
    parts: [
      {
        x: 0, y: 0, z: 0, w, d, h, role: 'dark', r: 1,
        top: [
          { rect: [6, 6, w - 12, d - 12], stroke: 'soft' },
          { rect: [w / 2 - 12, 9, 24, 4], r: 1, fill: 'soft', stroke: 'soft' },
          { rect: [w / 2 - 12, d - 13, 24, 4], r: 1, fill: 'soft', stroke: 'soft', view: 'iso' },
          { rect: [w / 2 - 8, d - 3.5, 16, 2.5], r: 1, accent: 'network', view: 'plan' }
        ],
        front: [
          { rect: [4, 6, w - 8, h - 12], stroke: 'soft' },
          ...Array.from({ length: slots - 1 }, (_, i) => ({ line: [[8, 6 + pitch * (i + 1)], [w - 8, 6 + pitch * (i + 1)]], stroke: 'soft' })),
          { rect: [w / 2 - 6, 10, 12, 2.5], accent: 'network' }
        ]
      }
    ]
  };
}

const wallRacks = [6, 9, 12, 15].map((u) =>
  rack({ id: `rack-wall-600x450-${u}u`, name: 'Wall-mount cabinet', w: 60, d: 45, u, mount: 150, sizeLabel: '600 × 450' })
);
const smallRacks = [18, 24, 27].map((u) =>
  rack({ id: `rack-600x600-${u}u`, name: 'Comms cabinet', w: 60, d: 60, u, sizeLabel: '600 × 600' })
);
const mediumRacks = [27, 32, 37, 42].map((u) =>
  rack({ id: `rack-600x800-${u}u`, name: 'Network cabinet', w: 60, d: 80, u, sizeLabel: '600 × 800' })
);
const serverRacks = [60, 80].flatMap((w) =>
  [100, 110, 120].flatMap((d) =>
    [42, 45].map((u) =>
      rack({ id: `rack-${w * 10}x${d * 10}-${u}u`, name: 'Server rack', w, d, u, sizeLabel: `${w * 10} × ${d * 10}` })
    )
  )
);

// Open racks: posts and rails only, no cabinet.
function openRack({ id, name, w, d, u, posts }) {
  const h = rackHeight(u);
  // Rails run left to right at the top, between the posts: one pair for a
  // 2-post frame, front and rear pairs for a 4-post frame.
  const railYs = posts === 2 ? [d / 2 - 2.5] : [4, d - 9];
  return {
    id,
    name: `${name} ${u}U`,
    group: 'comms',
    tags: ['network'],
    size: { w, d, h },
    parts: [
      { x: 0, y: 0, z: 0, w, d, h: 5, role: 'metal' },
      ...railYs.flatMap((y) => [
        { x: 4, y, z: 5, w: 5, d: 5, h: h - 10, role: 'metal', outline: true },
        { x: w - 9, y, z: 5, w: 5, d: 5, h: h - 10, role: 'metal', outline: true },
        { x: 4, y, z: h - 5, w: w - 8, d: 5, h: 5, role: 'metal', outline: true }
      ])
    ],
    plan: [{ rect: [w / 2 - 8, d - 3.5, 16, 2.5], r: 1, accent: 'network' }]
  };
}

const openRacks = [
  openRack({ id: 'rack-open-2post-24u', name: 'Open frame rack, 2-post', w: 53, d: 40, u: 24, posts: 2 }),
  openRack({ id: 'rack-open-2post-42u', name: 'Open frame rack, 2-post', w: 53, d: 40, u: 42, posts: 2 }),
  openRack({ id: 'rack-open-4post-42u', name: 'Open frame rack, 4-post', w: 60, d: 100, u: 42, posts: 4 })
];

// A small accent strip on the front edge of the plan, as on the racks, so the
// working side of a box reads on a plan.
const planStrip = (w, d, tag) => ({ rect: [w / 2 - Math.min(8, w / 2 - 4), d - 3.5, Math.min(16, w - 8), 2.5], r: 1, accent: tag, view: 'plan' });

// Floor-standing equipment cabinets (UPS, battery, cooling). One box with a
// front face of doors, grille and display, and vents or a panel on top.
// `fans` puts that many fan rings on the roof, spaced along the longer side.
function cabinet({ id, name, tag, w, d, h, role = 'dark', doors = 1, display = true, grille = false, vents = 0, fans = 0 }) {
  const ink = role === 'dark' ? 'soft' : 'detail';
  const along = w >= d;
  const pitch = ((along ? w : d) - 8) / Math.max(1, fans);
  const fanR = Math.min(pitch, (along ? d : w) - 8) / 2 - 3;
  const top = [
    { rect: [4, 4, w - 8, d - 8], stroke: ink },
    ...Array.from({ length: vents }, (_, i) => ({ line: [[8, 8 + ((d - 20) * (i + 0.5)) / vents], [w - 8, 8 + ((d - 20) * (i + 0.5)) / vents]], stroke: ink, view: 'plan' })),
    ...Array.from({ length: fans }, (_, i) => {
      const c = 4 + pitch * (i + 0.5);
      return { circle: along ? [c, d / 2 - 2, fanR] : [w / 2, c - 2, fanR], stroke: ink };
    }),
    planStrip(w, d, tag)
  ];
  const doorW = (w - 8) / doors;
  const front = [
    ...Array.from({ length: doors }, (_, i) => ({ rect: [4 + i * doorW, 4, doorW, h - 12], stroke: 'soft' })),
    ...(display ? [
      { rect: [w / 2 - Math.min(10, w * 0.3), h * 0.1, Math.min(20, w * 0.6), Math.min(10, h * 0.1)], fill: 'glass', stroke: 'soft' },
      { circle: [w / 2, h * 0.1 + Math.min(10, h * 0.1) + 4, 1.5], accent: tag }
    ] : [{ rect: [w / 2 - 4, 8, 8, 2.5], accent: tag }]),
    ...(grille ? Array.from({ length: 6 }, (_, i) => ({ line: [[8, h * 0.55 + i * h * 0.05], [w - 8, h * 0.55 + i * h * 0.05]], stroke: 'soft' })) : [])
  ];
  return { id, name, group: 'comms', tags: [tag], size: { w, d, h }, parts: [{ x: 0, y: 0, z: 0, w, d, h, role, r: 1, top, front }] };
}

// Wall-mounted panels: a shallow box whose door faces the room.
function wallPanel({ id, name, tag, w, d, h, mount, role = 'body', window: win }) {
  return {
    id, name, group: 'comms', tags: [tag], size: { w, d, h }, mount,
    parts: [{
      x: 0, y: 0, z: 0, w, d, h, role, r: 1,
      top: [planStrip(w, d, tag)],
      front: [
        { rect: [3, 3, w - 6, h - 6], stroke: 'detail' },
        ...win,
        { rect: [w - 9, h / 2 - 4, 3, 8], r: 1, fill: 'dark', stroke: 'detail' },
        { circle: [8, 8, 1.5], accent: tag }
      ]
    }]
  };
}

const rows = (u, v, w, n, pitch) => Array.from({ length: n }, (_, i) => ({ line: [[u, v + i * pitch], [u + w, v + i * pitch]] }));

const power = [
  cabinet({ id: 'ups-tower', name: 'UPS, tower', tag: 'power', w: 20, d: 45, h: 35, vents: 3, grille: true }),
  cabinet({ id: 'ups-large', name: 'UPS, floor-standing', tag: 'power', w: 35, d: 80, h: 130, vents: 4, grille: true }),
  cabinet({ id: 'battery-cabinet', name: 'Battery cabinet', tag: 'power', w: 60, d: 85, h: 200, doors: 2, display: false, vents: 4 }),
  wallPanel({
    id: 'distribution-board', name: 'Distribution board', tag: 'power', w: 60, d: 20, h: 90, mount: 110,
    window: [{ rect: [10, 15, 40, 50], fill: 'soft' }, ...rows(12, 25, 36, 3, 15)]
  }),
  wallPanel({
    id: 'ats-panel', name: 'Transfer switch panel', tag: 'power', w: 60, d: 25, h: 80, mount: 110,
    window: [{ rect: [12, 12, 36, 30], fill: 'soft' }, { circle: [30, 27, 8], fill: 'dark' }, { line: [[30, 27], [36, 21]], stroke: 'soft', weight: 'outline' }, { rect: [12, 50, 36, 8], fill: 'glass' }]
  }),
  {
    id: 'generator',
    name: 'Standby generator',
    group: 'comms',
    tags: ['power'],
    size: { w: 220, d: 110, h: 150 },
    parts: [
      { x: 0, y: 0, z: 0, w: 220, d: 110, h: 10, role: 'metal' },
      {
        x: 5, y: 5, z: 10, w: 210, d: 100, h: 130, r: 2, outline: true,
        top: [
          ...Array.from({ length: 6 }, (_, i) => ({ line: [[160 + i * 8, 12], [160 + i * 8, 88]], view: 'plan' })),
          { rect: [10, 10, 135, 80], stroke: 'soft' },
          planStrip(210, 100, 'power')
        ],
        front: [
          { rect: [10, 10, 60, 110] },
          { rect: [75, 10, 60, 110] },
          { rect: [140, 10, 60, 110] },
          { rect: [95, 25, 20, 12], fill: 'glass' },
          { circle: [105, 45, 2], accent: 'power' }
        ]
      },
      { cyl: [40, 40, 7], z: 140, h: 10, role: 'metal' }
    ]
  }
];

const cooling = [
  cabinet({ id: 'crac-unit', name: 'Precision air conditioner (CRAC)', tag: 'cooling', w: 100, d: 90, h: 195, role: 'body', doors: 2, grille: true, fans: 2 }),
  cabinet({ id: 'in-row-cooler', name: 'In-row cooler', tag: 'cooling', w: 30, d: 120, h: 200, grille: true, fans: 4 }),
  {
    id: 'ac-ceiling-cassette',
    name: 'AC ceiling cassette',
    group: 'comms',
    tags: ['cooling'],
    size: { w: 84, d: 84, h: 25 },
    mount: 270,
    // The plan shows the grille face: four louvre slots round a return grille.
    parts: [
      {
        x: 0, y: 0, z: 0, w: 84, d: 84, h: 3, r: 3,
        top: [
          { rect: [18, 4, 48, 5], r: 2, fill: 'soft' },
          { rect: [18, 75, 48, 5], r: 2, fill: 'soft' },
          { rect: [4, 18, 5, 48], r: 2, fill: 'soft' },
          { rect: [75, 18, 5, 48], r: 2, fill: 'soft' }
        ]
      },
      { x: 14, y: 14, z: 3, w: 56, d: 56, h: 22, role: 'soft' }
    ],
    plan: [
      { rect: [18, 18, 48, 48], fill: 'body' },
      ...rows(22, 26, 40, 5, 8),
      { rect: [60, 70.5, 6, 2.5], r: 1, accent: 'cooling' }
    ]
  },
  {
    id: 'ac-condenser',
    name: 'AC outdoor unit',
    group: 'comms',
    tags: ['cooling'],
    size: { w: 85, d: 35, h: 70 },
    parts: [{
      x: 0, y: 0, z: 0, w: 85, d: 35, h: 70, r: 1,
      top: [
        ...Array.from({ length: 8 }, (_, i) => ({ line: [[6 + i * 7, 3], [6 + i * 7, 12]], view: 'plan' })),
        { line: [[64, 4], [64, 31]], stroke: 'soft' },
        { rect: [68, 31.5, 12, 2], r: 1, accent: 'cooling', view: 'plan' }
      ],
      front: [
        { circle: [32, 35, 26], fill: 'soft' },
        { circle: [32, 35, 17] },
        { circle: [32, 35, 5], fill: 'dark' },
        { line: [[6, 35], [58, 35]] },
        { line: [[32, 9], [32, 61]] },
        { line: [[64, 4], [64, 66]] },
        { rect: [70, 10, 8, 2], accent: 'cooling' }
      ]
    }]
  },
  {
    id: 'containment-door',
    name: 'Aisle containment door',
    group: 'comms',
    tags: ['cooling'],
    size: { w: 120, d: 10, h: 200 },
    // Posts and header frame a pair of sliding glass leaves.
    parts: [
      { x: 0, y: 0, z: 0, w: 5, d: 10, h: 200, role: 'metal' },
      { x: 115, y: 0, z: 0, w: 5, d: 10, h: 200, role: 'metal', outline: true },
      {
        x: 5, y: 0, z: 190, w: 110, d: 10, h: 10, role: 'metal', outline: true,
        front: [{ rect: [51, 3, 8, 3], accent: 'cooling', view: 'iso' }]
      },
      { x: 5, y: 3, z: 0, w: 55, d: 4, h: 190, role: 'glass', front: [{ line: [[49, 80], [49, 110]], stroke: 'outline' }] },
      { x: 60, y: 3, z: 0, w: 55, d: 4, h: 190, role: 'glass', front: [{ line: [[6, 80], [6, 110]], stroke: 'outline' }] }
    ],
    plan: [
      { line: [[60, 1.5], [60, 8.5]] },
      { line: [[20, 5], [45, 5]], dash: '2 2' },
      { line: [[75, 5], [100, 5]], dash: '2 2' },
      { rect: [55, 7.5, 10, 2], r: 1, accent: 'cooling' }
    ]
  },
  {
    id: 'raised-floor-tile',
    name: 'Perforated floor tile',
    group: 'comms',
    tags: ['cooling'],
    size: { w: 60, d: 60, h: 1 },
    parts: [{
      x: 0, y: 0, z: 0, w: 60, d: 60, h: 1, role: 'metal',
      top: [
        ...Array.from({ length: 7 }, (_, i) => ({ line: [[8, 8 + i * 7], [52, 8 + i * 7]], dash: '0.1 3.6' })),
        { rect: [25, 55, 10, 2.5], r: 1, accent: 'cooling' }
      ]
    }]
  }
];

// Gas suppression cylinder: red is the conventional finish, so the body is
// fire red and the valve and actuator sit on its shoulder.
const fire = [
  {
    id: 'fire-suppression',
    name: 'Gas suppression cylinder',
    group: 'comms',
    tags: ['fire'],
    size: { w: 40, d: 40, h: 170 },
    parts: [
      { cyl: [20, 20, 18], z: 0, h: 140, role: 'fire' },
      { dome: [20, 20, 18], z: 140, h: 14, role: 'fire' },
      { cyl: [20, 20, 5], z: 154, h: 10, role: 'metal', outline: true },
      { x: 16, y: 16, z: 164, w: 8, d: 8, h: 6, role: 'dark', outline: true }
    ],
    plan: [{ circle: [30, 28, 3], fill: 'body', stroke: 'outline' }]
  }
];

const network = [
  {
    id: 'cable-tray',
    name: 'Cable tray section, 1 m',
    group: 'comms',
    tags: ['network'],
    size: { w: 100, d: 30, h: 10 },
    mount: 250,
    parts: [
      {
        x: 0, y: 0, z: 0, w: 100, d: 30, h: 1.5, role: 'metal', noInset: true,
        top: [
          ...[9, 15, 21].map((v) => ({ line: [[6, v], [94, v]], dash: '4 3' })),
          { rect: [84, 25.5, 10, 2], r: 1, accent: 'network', view: 'plan' }
        ]
      },
      { x: 0, y: 0, z: 1.5, w: 100, d: 1.5, h: 8.5, role: 'metal', outline: true },
      { x: 0, y: 28.5, z: 1.5, w: 100, d: 1.5, h: 8.5, role: 'metal', outline: true, front: [{ rect: [84, 2, 10, 2], accent: 'network' }] }
    ]
  },
  {
    id: 'ladder-rack',
    name: 'Ladder rack section, 1 m',
    group: 'comms',
    tags: ['network'],
    size: { w: 100, d: 45, h: 5 },
    mount: 240,
    parts: [
      { x: 0, y: 0, z: 0, w: 100, d: 4, h: 5, role: 'metal' },
      { x: 0, y: 41, z: 0, w: 100, d: 4, h: 5, role: 'metal', outline: true, top: [{ rect: [44, 1, 12, 2], r: 1, accent: 'network' }] },
      ...[8, 34, 60, 86].map((x) => ({ x, y: 4, z: 1, w: 6, d: 37, h: 3, role: 'metal', outline: true }))
    ]
  },
  {
    id: 'odf-panel',
    name: 'Fibre termination cabinet',
    group: 'comms',
    tags: ['network'],
    size: { w: 60, d: 30, h: 60 },
    mount: 120,
    parts: [{
      x: 0, y: 0, z: 0, w: 60, d: 30, h: 60, role: 'metal', r: 1,
      top: [
        { circle: [15, 8, 3] },
        { circle: [30, 8, 3] },
        { circle: [45, 8, 3] },
        planStrip(60, 30, 'network')
      ],
      front: [
        { rect: [3, 3, 54, 54] },
        { rect: [9, 9, 36, 42], fill: 'glass' },
        ...rows(12, 16, 30, 4, 9),
        { rect: [50, 26, 3, 8], r: 1, fill: 'dark' },
        { circle: [51.5, 9, 1.5], accent: 'network' }
      ]
    }]
  },
  {
    id: 'kvm-console',
    name: 'KVM console cart',
    group: 'comms',
    tags: ['network'],
    size: { w: 60, d: 70, h: 110 },
    // Castored base, a rear column carrying the monitor, and a keyboard tray.
    parts: [
      { x: 0, y: 0, z: 6, w: 60, d: 70, h: 6, role: 'metal', r: 3 },
      ...[[6, 6], [54, 6], [6, 64], [54, 64]].map(([cx, cy]) => ({ cyl: [cx, cy, 3], z: 0, h: 6, role: 'dark' })),
      { x: 25, y: 0, z: 12, w: 10, d: 6, h: 98, role: 'metal', outline: true },
      {
        x: 5, y: 6, z: 80, w: 50, d: 4, h: 30, role: 'dark', outline: true,
        top: [{ rect: [21, 1, 8, 2], accent: 'network', view: 'plan' }],
        front: [{ rect: [2, 2, 46, 24], fill: 'glass', stroke: 'soft' }, { circle: [44, 27.5, 1], accent: 'network' }]
      },
      {
        x: 5, y: 14, z: 72, w: 50, d: 50, h: 4, role: 'soft', outline: true,
        top: [{ rect: [4, 6, 42, 16], r: 1, fill: 'body' }, { rect: [18, 28, 14, 10], r: 1 }]
      }
    ]
  }
];

export default [
  ...wallRacks,
  ...smallRacks,
  ...mediumRacks,
  ...serverRacks,
  ...openRacks,
  {
    id: 'split-ac-indoor',
    name: 'Split AC, wall unit',
    group: 'comms',
    tags: ['cooling'],
    size: { w: 90, d: 25, h: 30 },
    mount: 210,
    parts: [
      {
        x: 0, y: 0, z: 0, w: 90, d: 25, h: 30, r: 4,
        top: [
          { line: [[6, 13], [84, 13]], view: 'plan' },
          { line: [[6, 17], [84, 17]], view: 'plan' },
          { line: [[6, 21], [84, 21]], view: 'plan' },
          { rect: [72, 4, 10, 2.5], accent: 'cooling', view: 'plan' }
        ],
        front: [
          { line: [[5, 20], [85, 20]] },
          { line: [[5, 24], [85, 24]] },
          { rect: [74, 5, 8, 2], accent: 'cooling' }
        ]
      }
    ]
  },
  ...power,
  ...cooling,
  ...fire,
  ...network
];
