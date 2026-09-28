// Bedroom.

// A bed with its head against the wall at the top: headboard, base, mattress,
// pillows, and a duvet over the lower part with its folded edge showing.
export function bed({ id, name, w, d }) {
  const pillows = w >= 120 ? 2 : 1;
  const gap = 6;
  const pw = (w - 12 - gap * (pillows - 1)) / pillows;
  return {
    id,
    name,
    group: 'bedroom',
    size: { w, d, h: 100 },
    parts: [
      { x: 0, y: 0, z: 0, w, d: 8, h: 100, role: 'soft' },
      {
        x: 0,
        y: 8,
        z: 0,
        w,
        d: d - 8,
        h: 30,
        role: 'soft',
        outline: true,
        r: 2
      },
      { x: 3, y: 10, z: 30, w: w - 6, d: d - 12, h: 22, r: 3, outline: true },
      ...Array.from({ length: pillows }, (_, i) => ({
        x: 6 + i * (pw + gap),
        y: 14,
        z: 52,
        w: pw,
        d: 28,
        h: 10,
        role: 'soft',
        r: 7
      })),
      {
        x: 3,
        y: Math.round(d * 0.3),
        z: 52,
        w: w - 6,
        d: d - 2 - Math.round(d * 0.3),
        h: 4,
        r: 3,
        top: [
          {
            line: [
              [0, 8],
              [w - 6, 8]
            ]
          }
        ]
      }
    ]
  };
}

export default [bed({ id: 'bed-queen', name: 'Bed, queen', w: 153, d: 203 })];
