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
        x: 0,
        y: 0,
        z: 0,
        w,
        d,
        h,
        role: 'dark',
        r: 1,
        top: [
          { rect: [6, 6, w - 12, d - 12], stroke: 'soft' },
          { rect: [w / 2 - 12, 9, 24, 4], r: 1, fill: 'soft', stroke: 'soft' },
          {
            rect: [w / 2 - 12, d - 13, 24, 4],
            r: 1,
            fill: 'soft',
            stroke: 'soft',
            view: 'iso'
          },
          {
            rect: [w / 2 - 8, d - 3.5, 16, 2.5],
            r: 1,
            accent: 'network',
            view: 'plan'
          }
        ],
        front: [
          { rect: [4, 6, w - 8, h - 12], stroke: 'soft' },
          ...Array.from({ length: slots - 1 }, (_, i) => ({
            line: [
              [8, 6 + pitch * (i + 1)],
              [w - 8, 6 + pitch * (i + 1)]
            ],
            stroke: 'soft'
          })),
          { rect: [w / 2 - 6, 10, 12, 2.5], accent: 'network' }
        ]
      }
    ]
  };
}

const wallRacks = [6, 9, 12, 15].map((u) =>
  rack({
    id: `rack-wall-600x450-${u}u`,
    name: 'Wall-mount cabinet',
    w: 60,
    d: 45,
    u,
    mount: 150,
    sizeLabel: '600 × 450'
  })
);
const smallRacks = [18, 24, 27].map((u) =>
  rack({
    id: `rack-600x600-${u}u`,
    name: 'Comms cabinet',
    w: 60,
    d: 60,
    u,
    sizeLabel: '600 × 600'
  })
);
const mediumRacks = [27, 32, 37, 42].map((u) =>
  rack({
    id: `rack-600x800-${u}u`,
    name: 'Network cabinet',
    w: 60,
    d: 80,
    u,
    sizeLabel: '600 × 800'
  })
);
const serverRacks = [60, 80].flatMap((w) =>
  [100, 110, 120].flatMap((d) =>
    [42, 45].map((u) =>
      rack({
        id: `rack-${w * 10}x${d * 10}-${u}u`,
        name: 'Server rack',
        w,
        d,
        u,
        sizeLabel: `${w * 10} × ${d * 10}`
      })
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
        {
          x: w - 9,
          y,
          z: 5,
          w: 5,
          d: 5,
          h: h - 10,
          role: 'metal',
          outline: true
        },
        {
          x: 4,
          y,
          z: h - 5,
          w: w - 8,
          d: 5,
          h: 5,
          role: 'metal',
          outline: true
        }
      ])
    ],
    plan: [{ rect: [w / 2 - 8, d - 3.5, 16, 2.5], r: 1, accent: 'network' }]
  };
}

const openRacks = [
  openRack({
    id: 'rack-open-2post-24u',
    name: 'Open frame rack, 2-post',
    w: 53,
    d: 40,
    u: 24,
    posts: 2
  }),
  openRack({
    id: 'rack-open-2post-42u',
    name: 'Open frame rack, 2-post',
    w: 53,
    d: 40,
    u: 42,
    posts: 2
  }),
  openRack({
    id: 'rack-open-4post-42u',
    name: 'Open frame rack, 4-post',
    w: 60,
    d: 100,
    u: 42,
    posts: 4
  })
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
        x: 0,
        y: 0,
        z: 0,
        w: 90,
        d: 25,
        h: 30,
        r: 4,
        top: [
          {
            line: [
              [6, 13],
              [84, 13]
            ],
            view: 'plan'
          },
          {
            line: [
              [6, 17],
              [84, 17]
            ],
            view: 'plan'
          },
          {
            line: [
              [6, 21],
              [84, 21]
            ],
            view: 'plan'
          },
          { rect: [72, 4, 10, 2.5], accent: 'cooling', view: 'plan' }
        ],
        front: [
          {
            line: [
              [5, 20],
              [85, 20]
            ]
          },
          {
            line: [
              [5, 24],
              [85, 24]
            ]
          },
          { rect: [74, 5, 8, 2], accent: 'cooling' }
        ]
      }
    ]
  }
];
