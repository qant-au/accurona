// Fire and safety. Ceiling and wall devices are plan symbols (see README,
// "Symbols"), with the same frame rule as security: a circle for ceiling
// devices (mounted at 260 cm or higher), a rounded square for wall and floor
// devices. One small fire-red mark per glyph; the extinguisher body is red
// because that is how an extinguisher is recognised. First aid and the AED
// carry no tag, so they have no accent.

const pointsOnArc = (cx, cy, r, from, to, n = 8) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
  });

// A small wall device: one box, back on the wall (y = 0), face towards the room.
const wallBox = (w, d, h, front, role = 'body') => [{ x: 0, y: 0, z: 0, w, d, h, role, r: 1, front }];

// Ceiling detectors: a base disc and a shallow dome, the glyph inside a ring.
function detector({ id, name, glyph }) {
  return {
    id,
    name,
    group: 'safety',
    tags: ['fire'],
    size: { w: 11, d: 11, h: 5 },
    mount: 270,
    symbol: {
      frame: 'circle',
      glyph: [{ circle: [20, 20, 13], fill: 'soft', stroke: 'outline' }, ...glyph]
    },
    parts: [
      { cyl: [5.5, 5.5, 5.5], z: 0, h: 2 },
      { dome: [5.5, 5.5, 4.5], z: 2, h: 3 }
    ]
  };
}

const symbols = [
  detector({
    id: 'smoke-detector',
    name: 'Smoke Detector',
    glyph: [
      { arc: [20, 16, 4, -30, -270], stroke: 'outline' },
      { arc: [20, 24, 4, -90, 150], stroke: 'outline' },
      { circle: [28, 13, 1.5], accent: 'fire' }
    ]
  }),
  detector({
    id: 'heat-detector',
    name: 'Heat Detector',
    glyph: [
      { rect: [18, 10, 4, 14], r: 2, fill: 'body', stroke: 'outline' },
      { circle: [20, 26, 3.5], accent: 'fire' }
    ]
  }),
  {
    // Red cylinder with a dark valve head and hose.
    id: 'fire-extinguisher',
    name: 'Fire Extinguisher',
    group: 'safety',
    tags: ['fire'],
    size: { w: 20, d: 20, h: 60 },
    symbol: {
      frame: 'square',
      glyph: [
        { rect: [14, 12, 12, 24], r: 5, fill: 'fire', stroke: 'outline' },
        { rect: [16, 6, 8, 6], r: 1, fill: 'dark', stroke: 'outline' },
        { line: [[24, 7], [29, 4]], stroke: 'outline' },
        { line: [[16, 9], [11, 12], [10, 27]], stroke: 'outline' }
      ]
    },
    parts: [
      { cyl: [10, 10, 8], z: 0, h: 46, role: 'fire' },
      { dome: [10, 10, 8], z: 46, h: 5, role: 'fire' },
      { cyl: [10, 10, 2.5], z: 51, h: 5, role: 'dark' },
      { x: 6, y: 9, z: 56, w: 8, d: 2, h: 4, role: 'dark' }
    ]
  },
  {
    // Wall pouch with two pull tapes hanging below.
    id: 'fire-blanket',
    name: 'Fire Blanket',
    group: 'safety',
    tags: ['fire'],
    size: { w: 26, d: 6, h: 30 },
    mount: 120,
    symbol: {
      frame: 'square',
      glyph: [
        { rect: [9, 5, 22, 22], r: 2, fill: 'soft', stroke: 'outline' },
        { line: [[9, 11], [31, 11]], stroke: 'detail' },
        { rect: [13, 27, 4, 8], accent: 'fire' },
        { rect: [23, 27, 4, 8], accent: 'fire' }
      ]
    },
    parts: wallBox(26, 6, 30, [
      { line: [[0, 6], [26, 6]] },
      { rect: [6, 24, 3, 6], accent: 'fire' },
      { rect: [17, 24, 3, 6], accent: 'fire' }
    ])
  },
  {
    // Box with a square frangible window and a red centre.
    id: 'manual-call-point',
    name: 'Manual Call Point',
    group: 'safety',
    tags: ['fire'],
    size: { w: 9, d: 6, h: 9 },
    mount: 110,
    symbol: {
      frame: 'square',
      glyph: [
        { rect: [8, 8, 24, 24], r: 2, fill: 'soft', stroke: 'outline' },
        { rect: [13, 13, 14, 14], fill: 'body', stroke: 'outline' },
        { rect: [17, 17, 6, 6], accent: 'fire' }
      ]
    },
    parts: wallBox(9, 6, 9, [
      { rect: [2, 2, 5, 5], fill: 'body' },
      { rect: [3.5, 3.5, 2, 2], accent: 'fire' }
    ])
  },
  {
    // Sign panel with a running figure, and an arrow out of it pointing down.
    id: 'exit-sign',
    name: 'Exit Sign',
    group: 'safety',
    tags: ['fire'],
    size: { w: 35, d: 5, h: 20 },
    mount: 220,
    symbol: {
      frame: 'square',
      glyph: [
        { rect: [5, 4, 30, 18], r: 2, fill: 'soft', stroke: 'outline' },
        { circle: [19, 8.5, 1.6], fill: 'outline', stroke: 'outline' },
        { line: [[15, 13], [18, 11.5], [22, 13]], stroke: 'outline' },
        { line: [[18, 11.5], [17, 15.5], [13, 18.5]], stroke: 'outline' },
        { line: [[17, 15.5], [21, 18.5]], stroke: 'outline' },
        { line: [[20, 22], [20, 30]], stroke: 'outline', weight: 'outline' },
        { line: [[13, 29], [27, 29], [20, 37]], closed: true, accent: 'fire' }
      ]
    },
    parts: wallBox(35, 5, 20, [
      { rect: [3, 3, 29, 14], fill: 'glass' },
      { line: [[17.5, 14], [17.5, 6], [14, 9.5]], stroke: 'outline' },
      { line: [[17.5, 6], [21, 9.5]], stroke: 'outline' },
      { rect: [28, 5, 2, 2], accent: 'fire' }
    ])
  },
  {
    // Ceiling batten with light falling from it.
    id: 'emergency-light',
    name: 'Emergency Light',
    group: 'safety',
    tags: ['fire'],
    size: { w: 30, d: 9, h: 5 },
    mount: 270,
    symbol: {
      frame: 'circle',
      glyph: [
        { rect: [7, 12, 26, 9], r: 2, fill: 'glass', stroke: 'outline' },
        { circle: [28, 16.5, 1.5], accent: 'fire' },
        { line: [[13, 24], [10, 31]], stroke: 'detail' },
        { line: [[20, 24], [20, 33]], stroke: 'detail' },
        { line: [[27, 24], [30, 31]], stroke: 'detail' }
      ]
    },
    parts: [
      { x: 0, y: 0, z: 2, w: 30, d: 9, h: 3, r: 1 },
      { x: 2, y: 1.5, z: 0, w: 26, d: 6, h: 2, role: 'glass', top: [{ rect: [22, 2, 2, 2], accent: 'fire', view: 'iso' }] }
    ]
  },
  {
    // Dark case with a handle and a white cross.
    id: 'first-aid',
    name: 'First Aid Kit',
    group: 'safety',
    size: { w: 30, d: 12, h: 22 },
    mount: 120,
    symbol: {
      frame: 'square',
      glyph: [
        { line: [[15, 11], [15, 6], [25, 6], [25, 11]], stroke: 'outline' },
        { rect: [7, 11, 26, 21], r: 3, fill: 'dark', stroke: 'outline' },
        {
          line: [[18, 15], [22, 15], [22, 19.5], [26.5, 19.5], [26.5, 23.5], [22, 23.5], [22, 28], [18, 28], [18, 23.5], [13.5, 23.5], [13.5, 19.5], [18, 19.5]],
          closed: true, fill: 'body', stroke: 'body'
        }
      ]
    },
    parts: wallBox(30, 12, 22, [
      { rect: [13, 5, 4, 12], fill: 'body', stroke: 'body' },
      { rect: [9, 9, 12, 4], fill: 'body', stroke: 'body' }
    ], 'dark')
  },
  {
    // Heart with a lightning bolt through it.
    id: 'aed',
    name: 'Defibrillator (AED)',
    group: 'safety',
    size: { w: 38, d: 15, h: 42 },
    mount: 110,
    symbol: {
      frame: 'square',
      glyph: [
        {
          line: [...pointsOnArc(14.5, 16, 5.5, 135, 360), ...pointsOnArc(25.5, 16, 5.5, 180, 405), [20, 32]],
          closed: true, fill: 'soft', stroke: 'outline'
        },
        { line: [[21.5, 11], [16, 21], [20, 21], [18, 29], [24.5, 18], [20.5, 18], [22.5, 11]], closed: true, fill: 'outline', stroke: 'outline' }
      ]
    },
    parts: wallBox(38, 15, 42, [
      { rect: [4, 4, 30, 34], fill: 'glass' },
      { rect: [11, 12, 16, 18], r: 2, fill: 'dark' },
      { line: [[20, 15], [17, 21], [21, 21], [18, 27]], stroke: 'body' }
    ])
  }
];

const equipment = [
  {
    // Wall reel: bracket on the wall, drum of hose in front, seen from above
    // as the coils of hose across the drum.
    id: 'hose-reel',
    name: 'Fire Hose Reel',
    group: 'safety',
    tags: ['fire'],
    size: { w: 80, d: 30, h: 80 },
    mount: 90,
    parts: [
      {
        x: 0, y: 5, z: 0, w: 80, d: 25, h: 80, r: 3,
        top: [
          ...[5, 10, 15, 20].map((v) => ({ line: [[6, v], [74, v]], view: 'plan' })),
          { rect: [36, 20.5, 8, 2.5], r: 1, accent: 'fire', view: 'plan' }
        ],
        front: [
          { circle: [40, 40, 36] },
          { circle: [40, 40, 28] },
          { circle: [40, 40, 20] },
          { circle: [40, 40, 7], fill: 'soft' },
          { rect: [58, 64, 6, 6], accent: 'fire' }
        ]
      },
      { x: 32, y: 0, z: 20, w: 16, d: 5, h: 40, role: 'metal', outline: true }
    ]
  },
  {
    id: 'fire-panel',
    name: 'Fire Indicator Panel',
    group: 'safety',
    tags: ['fire'],
    size: { w: 60, d: 15, h: 80 },
    mount: 120,
    parts: [{
      x: 0, y: 0, z: 0, w: 60, d: 15, h: 80, r: 1,
      top: [{ rect: [22, 11, 16, 2.5], r: 1, accent: 'fire', view: 'plan' }],
      front: [
        { rect: [3, 3, 54, 74] },
        { rect: [10, 10, 40, 12], fill: 'glass' },
        { rect: [10, 28, 3, 14], accent: 'fire' },
        ...[30, 36, 42].map((v) => ({ line: [[18, v], [50, v]] })),
        { circle: [45, 60, 3], fill: 'soft' },
        { rect: [52, 36, 2.5, 10], r: 1, fill: 'dark' }
      ]
    }]
  },
  {
    // Pedestal eyewash: floor flange, pipe, and a wide bowl with twin nozzles.
    id: 'eyewash',
    name: 'Eyewash Station',
    group: 'safety',
    size: { w: 50, d: 40, h: 100 },
    parts: [
      {
        cyl: [25, 20, 25, 20], z: 85, h: 15, role: 'body',
        top: [
          { ellipse: [25, 20, 20, 15], fill: 'soft' },
          { circle: [19, 20, 2.5], fill: 'metal', stroke: 'outline' },
          { circle: [31, 20, 2.5], fill: 'metal', stroke: 'outline' },
          { circle: [25, 28, 1.5] }
        ]
      },
      { cyl: [25, 20, 3], z: 3, h: 82, role: 'metal' },
      { cyl: [25, 20, 10], z: 0, h: 3, role: 'metal' }
    ]
  }
];

export default [...symbols, ...equipment];
