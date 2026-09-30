<p align="center">
  <img src="assets/accurona-logo.svg" alt="Accurona" width="360">
</p>

# Accurona

The shared core behind [Axonometra](https://github.com/qant-au/axonometra) (floor
plans and 3D) and [Reticulyne](https://github.com/qant-au/reticulyne) (network
diagrams): one source of truth for what the two tools draw, so the same thing looks
and measures the same in both, and so other tools can build on it too.

Today Accurona is the **element library**: furniture, fixtures, comms and security
equipment, with one set of groups, ids and look. It also holds the
[shared keymap](docs/keymap.md) both tools follow, and the
[scene format](docs/scene-format.md): one file for floor plans, isometric and 2D
diagrams, with one stable id per object: the file format both tools open and save,
implemented in `@accurona/core`.
And it holds the [shared UI](#shared-ui): the MUI theme, menus and panels both
tools are built from, so that switching between them needs no retraining.

## Elements

Each element is modelled **once**, as a few simple solids at real size in
centimetres. Every view is generated from that model:

- **Plan** (Axonometra): top-down, true to scale. _Built._
- **Isometric** (Reticulyne): shaded 30° view. _Experimental: generated but
  not yet reviewed item by item._
- **3D** (Axonometra's 3D view): the same solids as meshes, from
  `dist/models.json` (solids with colours resolved; decals left out). _Built._
- **2D schematic** (Reticulyne's planned flat view): a symbol for conventional
  network diagrams. _Planned._

So a rack is the same rack, the same size and the same colours in a floor plan
and in a network diagram, and nobody keeps two icon sets in step.

## Use

```sh
npm install
npm test                 # rules every element must meet
npm run build            # dist/manifest.json, dist/models.json, dist/plan/<id>.svg
npm run build -- --iso   # also dist/iso/<id>.svg (experimental)
npm run sheet            # review/<group>.png contact sheets
npm run sheet -- comms --iso
```

Consumers **vendor `dist/`** (copy it into their repo with a sync script)
rather than installing a package, so that Axonometra and Reticulyne, which are
open source, build without registry credentials.

## Layout

| Path                             | What                                                  |
| -------------------------------- | ----------------------------------------------------- |
| `src/groups.mjs`                 | The groups, in display order.                         |
| `src/elements/<group>.mjs`       | The elements of one group (default export: an array). |
| `src/palette.mjs`                | Colours and line weights.                             |
| `src/render/plan.mjs`, `iso.mjs` | The two renderers.                                    |
| `ITEMS.md`                       | The item list: ids, names and sizes still to build.   |
| `packages/ui/`                   | `@accurona/ui`, the shared UI (below).                |

## An element

```js
{
  id: 'sofa-3',              // kebab-case, unique, never renamed once shipped
  name: 'Sofa, 3-Seat',      // Title Case; a test enforces it
  group: 'living',
  tags: ['network'],         // optional: network, power, cooling, security, fire, av, safe
  size: { w: 210, d: 90, h: 85 },  // cm: width (x), depth (y), height (z)
  mount: 210,                // optional: cm from floor to the underside (wall and ceiling gear)
  parts: [ /* solids, below */ ],
  plan: [ /* optional decals drawn on top of the plan, in footprint cm */ ],
  symbol: { /* optional: draw on plans as a 40 cm symbol, below */ }
}
```

**Axes.** x runs left to right, y runs **back to front**, z runs up. The back
of the element (the side against a wall) is at y = 0, the top edge of the plan;
the side you use it from faces y = d, the bottom edge. Doors and fronts face the
bottom. In the isometric view the front (y = d) and right (x = w) faces show.

### Parts

Solids, in cm, all inside `size`, never overlapping each other (the isometric
renderer orders parts by assuming they are separate; overlapping solids draw in
the wrong order).

| Part                               | Shape                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `{ x, y, z, w, d, h, r? }`         | Box. `r` rounds its corners on the plan.                                                  |
| `{ cyl: [cx, cy, rx, ry?], z, h }` | Vertical cylinder, elliptical if `ry` is given.                                           |
| `{ dome: [cx, cy, r], z, h }`      | Dome (camera domes, lights).                                                              |
| `{ poly: [[x, y], ...], z, h }`    | Extruded polygon for L-shapes and curves. List points **clockwise** on the plan (y down). |

Common part options: `role` (fill, default `body`), `outline` (`true` draws
the part with the heavy plan outline; the first part has it unless it sets
`outline: false`), `dash` (a dashed plan outline, e.g. `'6 4'`, for overhead
items such as skylights), and decals per face: `top`, `front`, `side`.

**Roles:** `body`, `soft` (cushions, tops, trays), `dark` (equipment),
`metal`, `wood`, `glass` (glass and water), `plant`, `ground` (rugs, paving).

### Decals

Marks on a face, in cm relative to the face's top-left corner. On `top` that
is the top-left corner of the part's bounding box on the plan (for a `cyl`,
`dome` or `poly`, the box around it, not the plan origin); on `front` and `side`, v runs **down** from the
face's top edge.

| Decal                                                  | Draws                                            |
| ------------------------------------------------------ | ------------------------------------------------ |
| `{ line: [[u, v], ...], closed? }`                     | Polyline or polygon.                             |
| `{ rect: [u, v, w, h], r? }`                           | Rectangle.                                       |
| `{ circle: [u, v, r] }`, `{ ellipse: [u, v, rx, ry] }` | Circle, ellipse.                                 |
| `{ arc: [cx, cy, r, fromDeg, toDeg] }`                 | Arc (0° = +x, 90° = +y, i.e. towards the front). |

Options: `fill` (a role or accent), `stroke` (a role, `outline` or `detail`;
default `detail`), `accent` (a tag colour, filled, for LEDs and status marks),
`dash`, `weight: 'outline'` (heavy line), and `view: 'plan'` or `'iso'` to
draw in one view only. A decal on `top` that only makes sense seen from above
(louvres, seat lines on an item mounted high) takes `view: 'plan'`.

### Symbols

Ceiling and wall devices (cameras, detectors, access points, sensors, call
points) are far too small to see at plan scale. They set `symbol`, and the plan
draws a **40 × 40 cm** frame with a pictogram instead of the model, while
`size` and `parts` still describe the real device for the isometric and 3D
views.

```js
symbol: {
  frame: 'circle',   // or 'square'
  glyph: [ /* decals in the 40 × 40 box; default stroke is the outline colour */ ]
}
```

Point directional devices (cameras, sirens, exit signs) towards the **bottom**
of the symbol.

## Shared UI

`@accurona/ui` (`packages/ui/`) is what Axonometra and Reticulyne share on
screen. Both use [MUI](https://mui.com); these are the parts that must look and
behave the same in both:

| Export                                 | What                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| `createLineworkTheme(mode)`            | The theme: palette, type, shadows, component defaults.             |
| `ToolButton`, `ToolMenu`, `Surface`    | Toolbar buttons, a menu that opens on hover or click, their card.  |
| `SidePanel`, `FloatingPanel`           | A panel from the right; a non-modal panel pinned top right (help). |
| `AppDialog`, `CloseButton`             | A modal with a titled header; every close is named "Close".        |
| `notify()`, `NotificationHost`         | Transient messages, raised from anywhere, including plain classes. |
| `ContextMenu`                          | The right-click menu on the drawing.                               |
| `KeyboardShortcutsDialog`              | The `?` list, from the shared keymap, with its Excalidraw differences. |
| `Panel`, `PanelSection`, `PanelHeader` | A properties panel: sticky header, titled sections.                |

`createLineworkTheme(mode, { cssVariables })` leaves MUI's CSS variables off
unless asked: MUI writes them to `:root`, which an embedded editor must not do
to its host page. `lineworkThemeOptions(mode)` and `lineworkVars(mode)` give
the same theme as options, for a host that builds its own.

It is built with `tsc` to `packages/ui/dist/` (JavaScript plus types) by
`npm run build`, and takes React, MUI and Emotion as peer dependencies.
Consumers vendor `packages/ui/dist/` the same way as `dist/`.

## House style

- **Recognisable at 1:50, no more.** A plan is read from across a room, not
  inspected. Aim for 5 to 25 marks per element; the plan SVG must stay under
  4 KB (a test enforces it).
- **Colour carries meaning, sparingly.** Bodies are off-white or grey; accent
  colours mark a device's kind (blue network, orange power, teal cooling, red
  security and fire, purple AV, green safe: first aid and evacuation) in one small place: a status strip, a lens, a
  panel. Never a whole body.
- **Model real sizes.** Take dimensions from common Australian products; the
  sizes in `ITEMS.md` are the brief.
- **Families from functions.** When items differ only in size (beds, racks,
  wardrobes, desks), write one function and call it per size, as
  `bed()` in `bedroom.mjs` and `rack()` in `comms.mjs` do.

## Contributing

Issues and pull requests are welcome.

- **Found a bug, or have an idea or a question?**
  [Open an issue](https://github.com/qant-au/accurona/issues/new/choose). For anything
  substantial, open the issue before writing code so we can agree on the scope.
- **Sending a pull request?** Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks
  and conventions.
- **Found a security problem?** Report it privately, as described in
  [SECURITY.md](SECURITY.md).

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Author

Created and maintained by **Adam Burgess** ([adamburgess.me](https://adamburgess.me)).
Adam is available for customer implementation work through
[QANT Pty Ltd](https://qant.au).

## License

MIT. Every element is drawn here, from scratch; nothing is copied from a
third-party icon set.
