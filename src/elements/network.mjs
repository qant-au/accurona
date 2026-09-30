// Networking and AV. Desk and shelf devices are dark boxes with a status
// strip in the tag colour on the front edge of the top (as the racks in
// comms.mjs), and ports and LEDs on the front face. Ceiling and wall devices
// are plan symbols (see README, "Symbols").

// A row of `n` ports on a front face, starting at u, centred on v.
const ports = (n, u, v, pw = 1.4, ph = 1.1, pitch = 1.8) =>
  Array.from({ length: n }, (_, i) => ({ rect: [u + i * pitch, v - ph / 2, pw, ph], fill: 'outline', stroke: 'outline' }));

// Small LEDs in a row, in the accent colour.
const leds = (n, u, v, accent, pitch = 1.5, r = 0.35) =>
  Array.from({ length: n }, (_, i) => ({ circle: [u + i * pitch, v, r], accent }));

// The status strip at the front edge of the top, as on the racks.
const strip = (w, d, accent) => {
  const s = Math.min(10, Math.round(w * 0.3));
  return { rect: [w / 2 - s / 2, d - 3, s, 2], r: 0.5, accent, view: 'plan' };
};

// Vent slots across the back of the top.
const vents = (w, n, y0 = 3, gap = 2) =>
  Array.from({ length: n }, (_, i) => ({ line: [[w * 0.2, y0 + i * gap], [w * 0.8, y0 + i * gap]] }));

// A low desktop box: switch, router, firewall, NBN box.
function appliance({ id, name, tags, w, d, h, mount, role = 'dark', accent = tags[0], nPorts, nLeds = 3, ledAccent = accent }) {
  const v = h / 2 + 0.6;
  return {
    id, name, group: 'network', tags,
    size: { w, d, h },
    ...(mount ? { mount } : {}),
    parts: [
      {
        x: 0, y: 0, z: 0, w, d, h, role, r: 1,
        top: [...vents(w, 3), strip(w, d, accent)],
        front: [
          ...ports(nPorts, 3, v),
          ...leds(nLeds, w - 3 - (nLeds - 1) * 1.5, v, ledAccent)
        ]
      }
    ]
  };
}

// A tower case standing on its narrow side: front bezel faces the user.
function tower({ id, name, w, d, h, bays, bayH = 3 }) {
  return {
    id, name, group: 'network', tags: ['network'],
    size: { w, d, h },
    parts: [
      {
        x: 0, y: 0, z: 0, w, d, h, role: 'dark', r: 1,
        top: [
          ...[0.3, 0.5, 0.7].map((k) => ({ line: [[w * k, d * 0.25], [w * k, d * 0.6]] })),
          strip(w, d, 'network')
        ],
        front: [
          ...Array.from({ length: bays }, (_, i) => ({ rect: [3, 4 + i * (bayH + 1), w - 6, bayH], stroke: 'soft' })),
          { circle: [w / 2, 4 + bays * (bayH + 1) + 3, 1.2], accent: 'network' },
          ...[0, 1, 2].map((i) => ({ line: [[4, h - 10 + i * 2.5], [w - 4, h - 10 + i * 2.5]], stroke: 'soft' }))
        ]
      }
    ]
  };
}

export default [
  // Ceiling access point: a flat disc with a status ring.
  {
    id: 'wifi-ap',
    name: 'Wi-Fi Access Point',
    group: 'network',
    tags: ['network'],
    size: { w: 22, d: 22, h: 4 },
    mount: 270,
    symbol: {
      frame: 'circle',
      glyph: [
        { arc: [20, 28, 16, 225, 315], weight: 'outline' },
        { arc: [20, 28, 10.5, 225, 315], weight: 'outline' },
        { arc: [20, 28, 5, 225, 315], weight: 'outline' },
        { circle: [20, 28, 2.2], accent: 'network' }
      ]
    },
    parts: [{ cyl: [11, 11, 11], z: 0, h: 4, top: [{ circle: [11, 11, 3], stroke: 'network' }, { circle: [11, 11, 1], accent: 'network' }] }]
  },

  appliance({ id: 'network-switch', name: 'Network Switch (Desktop)', tags: ['network'], w: 44, d: 30, h: 5, nPorts: 16, nLeds: 4 }),
  appliance({ id: 'router', name: 'Router', tags: ['network'], w: 30, d: 20, h: 5, nPorts: 5 }),
  appliance({ id: 'modem-nbn', name: 'NBN Connection Box', tags: ['network'], w: 30, d: 20, h: 10, mount: 30, role: 'body', nPorts: 4, nLeds: 4 }),

  // Wall data outlet, double: a plate with two jacks. Plan symbol: the data
  // triangle, base against the wall (top), with the two ports.
  {
    id: 'data-outlet',
    name: 'Data Outlet',
    group: 'network',
    tags: ['network'],
    size: { w: 7, d: 1.5, h: 11.5 },
    mount: 30,
    symbol: {
      frame: 'square',
      glyph: [
        { line: [[7, 9], [33, 9], [20, 33]], closed: true, weight: 'outline' },
        { rect: [13, 12.5, 5, 4.5], accent: 'network' },
        { rect: [22, 12.5, 5, 4.5], accent: 'network' }
      ]
    },
    parts: [
      {
        x: 0, y: 0, z: 0, w: 7, d: 1.5, h: 11.5, r: 0.5,
        front: [{ rect: [2, 2.5, 3, 2.5], fill: 'outline', stroke: 'outline' }, { rect: [2, 6.5, 3, 2.5], fill: 'outline', stroke: 'outline' }, { rect: [2.5, 10, 2, 0.6], accent: 'network' }]
      }
    ]
  },

  // Floor box: flush lid over a recessed tub, data on the left, power on the right.
  {
    id: 'floor-box',
    name: 'Floor Box',
    group: 'network',
    tags: ['network', 'power'],
    size: { w: 40, d: 40, h: 10 },
    parts: [
      {
        x: 0, y: 0, z: 9, w: 40, d: 40, h: 1, role: 'metal', r: 2,
        top: [
          { rect: [4, 4, 32, 32], r: 1 },
          { line: [[20, 7], [20, 33]] },
          { rect: [8, 26, 8, 3], accent: 'network' },
          { rect: [24, 26, 8, 3], accent: 'power' },
          { rect: [10, 10, 4, 10], r: 1 },
          { rect: [26, 10, 4, 10], r: 1 }
        ]
      },
      { x: 1, y: 1, z: 0, w: 38, d: 38, h: 9, role: 'dark' }
    ]
  },

  // Ceiling projector on a drop pole; the lens faces the front (bottom).
  {
    id: 'projector',
    name: 'Ceiling Projector',
    group: 'network',
    tags: ['av'],
    size: { w: 35, d: 30, h: 25 },
    mount: 270,
    symbol: {
      frame: 'circle',
      glyph: [
        { line: [[16, 25], [9, 34]], stroke: 'detail' },
        { line: [[24, 25], [31, 34]], stroke: 'detail' },
        { rect: [8, 9, 24, 13], r: 2, fill: 'dark', stroke: 'outline' },
        { rect: [16, 22, 8, 3], accent: 'av' }
      ]
    },
    parts: [
      { x: 0, y: 0, z: 0, w: 35, d: 26, h: 12, r: 2, top: [{ rect: [4, 4, 12, 6], stroke: 'detail' }], front: [{ circle: [6, 6, 0.8], accent: 'av' }] },
      { x: 20, y: 26, z: 2, w: 10, d: 4, h: 8, role: 'dark', front: [{ circle: [5, 4, 3], fill: 'glass' }] },
      { x: 15, y: 10, z: 12, w: 5, d: 5, h: 10, role: 'metal' },
      { x: 10, y: 7, z: 22, w: 15, d: 11, h: 3, role: 'metal' }
    ]
  },

  // Motorised roller screen: case at the top, fabric hanging to a bottom bar.
  {
    id: 'projector-screen',
    name: 'Projector Screen',
    group: 'network',
    tags: ['av'],
    size: { w: 240, d: 15, h: 180 },
    mount: 90,
    parts: [
      {
        x: 0, y: 0, z: 170, w: 240, d: 15, h: 10, r: 3,
        top: [{ line: [[8, 7.5], [232, 7.5]], dash: '4 3' }, { rect: [220, 10, 12, 2.5], accent: 'av' }],
        front: [{ rect: [220, 4, 10, 2], accent: 'av' }]
      },
      { x: 6, y: 7, z: 2, w: 228, d: 1, h: 168, front: [{ rect: [4, 4, 220, 3], fill: 'outline', stroke: 'outline' }] },
      { x: 6, y: 6, z: 0, w: 228, d: 3, h: 2, role: 'metal' }
    ]
  },

  // Ceiling speaker: round grille flush with the ceiling, back can above.
  {
    id: 'speaker-ceiling',
    name: 'Ceiling Speaker',
    group: 'network',
    tags: ['av'],
    size: { w: 21, d: 21, h: 12 },
    mount: 270,
    symbol: {
      frame: 'circle',
      glyph: [
        { rect: [9, 16, 5, 8], fill: 'dark', stroke: 'outline' },
        { line: [[14, 16], [21, 10], [21, 30], [14, 24]], closed: true, fill: 'dark', stroke: 'outline' },
        { arc: [22, 20, 5, -45, 45], stroke: 'av', weight: 'outline' },
        { arc: [22, 20, 10, -45, 45], stroke: 'av', weight: 'outline' }
      ]
    },
    parts: [
      { cyl: [10.5, 10.5, 10.5], z: 0, h: 1 },
      { cyl: [10.5, 10.5, 8], z: 1, h: 11, role: 'metal' }
    ]
  },

  // Video bar under the display: camera in the middle, speakers either side.
  {
    id: 'video-bar',
    name: 'Video Conferencing Bar',
    group: 'network',
    tags: ['av'],
    size: { w: 90, d: 10, h: 10 },
    mount: 150,
    parts: [
      {
        x: 0, y: 0, z: 0, w: 90, d: 10, h: 10, role: 'dark', r: 3,
        top: [{ circle: [45, 6.5, 2.2], accent: 'av' }],
        front: [
          { circle: [45, 5, 2.5], fill: 'glass', stroke: 'soft' },
          { circle: [49.5, 3, 0.5], accent: 'av' },
          ...[20, 70].flatMap((c) => [3, 5, 7].map((v) => ({ line: [[c - 14, v], [c + 14, v]], stroke: 'soft' })))
        ]
      }
    ]
  },

  tower({ id: 'pc-tower', name: 'Desktop PC', w: 20, d: 45, h: 45, bays: 2 }),

  // 27" monitor: panel on a neck and a flat foot that reaches the front.
  {
    id: 'monitor',
    name: 'Monitor, 27"',
    group: 'network',
    tags: ['network'],
    size: { w: 62, d: 20, h: 45 },
    parts: [
      {
        x: 0, y: 6, z: 10, w: 62, d: 3, h: 35, role: 'dark', r: 1,
        top: [{ rect: [51, 1.8, 4, 1.2], accent: 'network', view: 'plan' }],
        front: [{ rect: [1, 1, 60, 31], fill: 'outline', stroke: 'outline' }, { circle: [56, 33.5, 0.5], accent: 'network' }]
      },
      { x: 28, y: 2, z: 2, w: 6, d: 4, h: 28, role: 'metal' },
      { x: 19, y: 2, z: 0, w: 24, d: 16, h: 2, role: 'metal', r: 4, outline: true }
    ]
  },

  // Laptop, open: the plan shows the keyboard and trackpad below the lid.
  {
    id: 'laptop',
    name: 'Laptop',
    group: 'network',
    tags: ['network'],
    size: { w: 34, d: 24, h: 23 },
    parts: [
      {
        x: 0, y: 1.5, z: 0, w: 34, d: 22.5, h: 2, role: 'metal', r: 1.5,
        top: [
          { rect: [3, 2, 28, 10], r: 0.5, fill: 'soft' },
          { rect: [12, 13.5, 10, 7], r: 0.5 },
          { rect: [29, 20.5, 2.5, 1], accent: 'network' }
        ]
      },
      { x: 0, y: 0, z: 0, w: 34, d: 1.5, h: 23, role: 'dark', r: 0.5, outline: true, front: [{ rect: [1.5, 1.5, 31, 19], fill: 'outline', stroke: 'outline' }, { circle: [17, 0.8, 0.3], accent: 'network' }] }
    ]
  },

  // Desk phone: raised back with the display, keypad in front, handset on the left.
  {
    id: 'ip-phone',
    name: 'Desk Phone',
    group: 'network',
    tags: ['network'],
    size: { w: 22, d: 20, h: 15 },
    parts: [
      {
        x: 0, y: 0, z: 0, w: 22, d: 8, h: 15, role: 'dark', r: 1,
        top: [{ rect: [9, 1.5, 11, 5], fill: 'glass', stroke: 'glass' }, { rect: [3.5, 3, 2.5, 1.5], accent: 'network' }]
      },
      {
        x: 0, y: 8, z: 0, w: 22, d: 12, h: 6, role: 'dark', r: 1, outline: true,
        top: [0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => ({ circle: [12 + c * 3.5, 2 + r * 2.7, 0.8], fill: 'soft', stroke: 'soft' })))
      },
      { x: 1, y: 8.5, z: 6, w: 7, d: 11, h: 3, role: 'dark', r: 2, outline: true }
    ]
  },

  appliance({ id: 'firewall', name: 'Firewall Appliance (Desktop)', tags: ['network', 'security'], w: 30, d: 20, h: 5, accent: 'security', ledAccent: 'network', nPorts: 8 }),

  tower({ id: 'server-tower', name: 'Tower Server', w: 20, d: 60, h: 45, bays: 4 }),

  // NAS: two front-loading drive bays with a status LED each.
  {
    id: 'nas',
    name: 'Network Storage (NAS)',
    group: 'network',
    tags: ['network'],
    size: { w: 20, d: 25, h: 25 },
    parts: [
      {
        x: 0, y: 0, z: 0, w: 20, d: 25, h: 25, role: 'dark', r: 1,
        top: [...vents(20, 3, 4, 2.5), strip(20, 25, 'network')],
        front: [
          { rect: [2.5, 3, 7, 16], stroke: 'soft' },
          { rect: [10.5, 3, 7, 16], stroke: 'soft' },
          ...leds(3, 7.5, 21.5, 'network', 2.5, 0.5)
        ]
      }
    ]
  }
];
