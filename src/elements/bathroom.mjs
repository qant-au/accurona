// Bathroom and laundry.
export default [
  {
    id: 'toilet',
    name: 'Toilet',
    group: 'bathroom',
    size: { w: 40, d: 70, h: 80 },
    parts: [
      { x: 0, y: 0, z: 0, w: 40, d: 19, h: 80, r: 2.5, top: [{ rect: [15, 6, 10, 4], r: 2 }] },
      {
        cyl: [20, 44.5, 17, 25], z: 0, h: 40, outline: true,
        top: [{ ellipse: [17, 27, 11, 16], fill: 'glass' }]
      }
    ]
  }
];
