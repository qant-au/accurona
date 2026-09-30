// One building as an Accurona scene: a comms room on a floor plan, and the
// same devices as a network diagram. Axonometra draws the plan view and
// Reticulyne the iso view; the objects (ids ap-1, cam-1, fw-1) are shared.
// Icons for the diagram come from @accurona/elements' plan drawings; the
// build decides their URLs, so they are passed in.
export const sceneWith = (icons) => ({
  $schema: 'https://cdn.jsdelivr.net/npm/@accurona/core@0/schema/scene-v1.json',
  format: 'accurona-scene',
  version: 1,
  id: 'verify',
  title: 'Comms room',
  units: 'mm',
  icons,
  objects: [
    { id: 'ap-1', name: 'Access point', element: 'wifi-ap', icon: 'wifi-ap' },
    { id: 'cam-1', name: 'Camera', element: 'cctv-dome', icon: 'cctv-dome' },
    { id: 'fw-1', name: 'Firewall', element: 'firewall', icon: 'firewall' }
  ],
  connections: [{ id: 'c1', from: 'cam-1', to: 'fw-1' }],
  views: [
    {
      id: 'plan',
      kind: 'plan',
      name: 'Floor plan',
      floors: [
        {
          id: 'g',
          nodes: [
            { id: 'n1', x: 0, y: 0 },
            { id: 'n2', x: 4000, y: 0 },
            { id: 'n3', x: 4000, y: 3000 },
            { id: 'n4', x: 0, y: 3000 }
          ],
          walls: [
            { id: 'w1', from: 'n1', to: 'n2', exterior: true },
            { id: 'w2', from: 'n2', to: 'n3', exterior: true },
            { id: 'w3', from: 'n3', to: 'n4', exterior: true },
            { id: 'w4', from: 'n4', to: 'n1', exterior: true }
          ]
        }
      ],
      placements: [
        { object: 'ap-1', floor: 'g', x: 2000, y: 1500 },
        { object: 'cam-1', floor: 'g', x: 600, y: 600 },
        { object: 'fw-1', floor: 'g', x: 3400, y: 2400 }
      ]
    },
    {
      id: 'net',
      kind: 'iso',
      name: 'Network',
      placements: [
        { object: 'ap-1', tile: { x: 0, y: 0 } },
        { object: 'cam-1', tile: { x: -3, y: 2 } },
        { object: 'fw-1', tile: { x: 3, y: -2 } }
      ],
      connectors: [
        {
          id: 'k1',
          connection: 'c1',
          anchors: [
            { id: 'a1', ref: { object: 'cam-1' } },
            { id: 'a2', ref: { object: 'fw-1' } }
          ]
        }
      ]
    }
  ]
});
