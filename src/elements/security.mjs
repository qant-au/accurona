// Security. Most devices here are plan symbols (see README, "Symbols"): the
// plan shows a 40 cm symbol, while `size` and `parts` model the real device.
export default [
  {
    id: 'cctv-dome',
    name: 'CCTV dome camera',
    group: 'security',
    tags: ['security'],
    size: { w: 14, d: 14, h: 10 },
    mount: 270,
    symbol: {
      frame: 'circle',
      glyph: [
        {
          line: [
            [20, 20],
            [8, 36]
          ],
          stroke: 'detail'
        },
        {
          line: [
            [20, 20],
            [32, 36]
          ],
          stroke: 'detail'
        },
        { circle: [20, 20, 9], fill: 'dark', stroke: 'outline' },
        { circle: [20, 23, 3], accent: 'security' }
      ]
    },
    parts: [
      { cyl: [7, 7, 7], z: 0, h: 3 },
      { dome: [7, 7, 5.5], z: 3, h: 5.5, role: 'dark' }
    ]
  }
];
