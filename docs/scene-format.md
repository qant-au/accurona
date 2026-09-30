# Accurona scene format

**Status: specification, version 1.** This is the **native file format** of Accurona,
[Axonometra](https://github.com/qant-au/axonometra) and
[Reticulyne](https://github.com/qant-au/reticulyne): each saves and opens a scene as a
plain `.json` file, not as an import or export target beside a format of its own.
Both editors read and write it, and `@accurona/core` (`packages/core`) implements it.

- **One schema.** A scene is validated by one [Zod 4](https://zod.dev) schema, defined
  in the `@accurona/core` package and imported by Axonometra and Reticulyne. Neither
  tool keeps a schema of its own. This document and that schema say the same thing:
  the package's tests validate every example below.
- **A JSON Schema for everyone else.** The build generates a JSON Schema (Draft
  2020-12) from the Zod schema (`z.toJSONSchema()`), and each release publishes it, so a
  scene can be validated in any language without Accurona's code. A file names it in
  its [`$schema`](#top-level-shape) field.
- **Element definitions are not scenes.** Accurona's element library stays library
  source; a scene refers to its elements by id.

One JSON document describes a floor plan, an isometric network diagram and a flat 2D
(schematic) diagram of the same things, so that the tools open and save the same file,
and so that code, or a language model, can write a drawing without knowing either
editor.

## The one idea

**A thing exists once, and is placed in any number of views.**

The scene has one list of **objects**: a rack, a switch, a camera, a sofa. Each has
one stable `id`. A **view** (a floor plan, an isometric diagram, a schematic) does not
contain objects; it **places** them. So the access point on the level 2 plan and the
access point node in the network diagram are the same object, with the same `id`, placed
twice. Nothing else is needed to link them.

Reticulyne already works this way for its own views (model `items`, placed by view
`items`). This format extends the same rule to floor plans.

## Top-level shape

```ts
interface Scene {
  $schema?: string;         // URL of the published JSON Schema for this version
  format: 'accurona-scene'; // fixed; identifies the file
  version: 1;               // schema version, see Versioning
  id: Id;                   // this scene's own id
  title?: string;           // max 100; default 'Untitled'
  description?: string;     // max 1000
  units?: 'mm' | 'cm' | 'm' | 'in' | 'ft-in'; // display and entry unit; default 'mm'
  objects: SceneObject[];   // the model: every thing, once
  connections?: Connection[]; // logical links between objects
  views?: View[];           // where objects are drawn; default []
  layers?: Layer[];         // default []
  icons?: Icon[];           // custom icons, for objects with no element
  colors?: Color[];         // named colours views can refer to
  links?: ExternalLink[];   // links back to external tools, for the whole scene
}
```

A scene with `objects` and no `views` is valid: it says what exists and how it
connects, and leaves the drawing to an editor (see [Writing a scene from code](#writing-a-scene-from-code)).

- **`$schema`** points at the JSON Schema published for this version, in the form
  `https://cdn.jsdelivr.net/npm/@accurona/core@<major>/schema/scene-v1.json`. It is
  optional and never changes how a file is read; it lets an editor or a validator in any
  language find the schema. Editors write it on save.
- **`units`** is how lengths are **shown and typed**, not how they are stored. Every
  length is stored in millimetres whatever it says (see [Plan views](#plan-views)), so
  changing it never rewrites a number. Showing and entering other units is the editors'
  job, not the format's.

## Ids

```ts
type Id = string; // /^[A-Za-z0-9_-]{1,64}$/
```

- **Unique within its collection** (objects, connections, views, floors, walls,
  connectors and so on each form one collection per scope; a floor's walls are unique
  within the view).
- **Opaque.** Nothing may parse meaning out of an id. `ap-level2-east` and
  `01J9Z3K8...` are equally valid.
- **Stable.** An editor never renames an id and never reuses one, including after a
  delete. This is what lets another scene, a ticket or an external tool point at an
  object and still find it later.
- **From outside the scene**, an object is addressed as `<sceneId>/<objectId>`.

Editors that create objects should generate collision-free ids (a ULID or UUID is
fine). Hand-written and generated scenes may use readable ones.

## Objects

```ts
interface SceneObject {
  id: Id;
  element?: string;       // an Accurona element id, e.g. 'rack-600x1000-42u'
  icon?: Id;              // an entry in `icons`, when there is no element
  name?: string;          // max 100; shown as the label
  description?: string;   // max 1000
  tags?: string[];        // e.g. ['network', 'poe']; max 20, each max 40
  props?: Record<string, string | number | boolean>; // max 50 keys
  ports?: Port[];         // where connections attach; ids unique within the object
  links?: ExternalLink[]; // links back to external tools
}

interface Port {
  id: Id;                 // e.g. 'eth1', '24', 'psu-a'
  name?: string;          // max 100
  kind?: string;          // free text, e.g. 'ethernet', 'sfp', 'power'
  props?: Record<string, string | number | boolean>; // max 50 keys
  links?: ExternalLink[]; // e.g. the port on a switch controller
}
```

- **`element`** is the usual case for a physical thing. An
  [Accurona element](../README.md#elements) brings its real size, its plan drawing and
  its 3D model, and its isometric view and 2D symbol where Reticulyne draws with it, so
  the object needs nothing else to be drawn anywhere. Element ids are never renamed
  once shipped, which is why a scene can store them.
- **`icon`** covers things the library does not have: a Reticulyne isopack icon or an
  uploaded image. An object with an `icon` and no `element` can be drawn in diagram
  views, and in a plan view only as a symbol.
- **Doors and windows are not in the library yet.** Until they are, `element` may also
  name one of Axonometra's built-in wall fittings (`door`, `window` and the rest), so a
  plan can be carried in full.
- An object with neither is drawn as a plain labelled box.
- **Two catalogues.** Accurona's element library holds physical things; the things a
  diagram connects, including virtual ones that never appear on a floor plan, come from
  Reticulyne's own catalogue, which is where ports, media and protocols are defined.
  An object on both a floor plan and a diagram is still **one object**: its `id` is what
  links the two views. The catalogues relate their entries by a free-form
  cross-reference ([what belongs in the library](../README.md#what-belongs-in-the-library)),
  which a scene never needs.
- **`props`** holds the facts about the thing: an IP address, a MAC, a serial number, a
  port count. Flat, and scalar values only, so that every tool can show and edit it as
  a table without knowing what the keys mean.
- **`ports`** are the points a connection can attach to: a switch's ports, a patch
  panel's sockets, a device's power inlets. An object lists only the ports it needs;
  a connection to an object with no ports attaches to the object as a whole.

## Connections

A connection is a **logical** link between two objects: this camera is patched to that
switch. It belongs to the model, not to a view, so it survives when the objects are
drawn somewhere else.

```ts
interface Connection {
  id: Id;
  from: Id;               // an object id
  fromPort?: Id;          // a port of the `from` object
  to: Id;                 // an object id
  toPort?: Id;            // a port of the `to` object
  kind?: string;          // free text, e.g. 'ethernet', 'fibre', 'power', 'wireless'
  name?: string;          // max 100
  description?: string;   // max 1000
  props?: Record<string, string | number | boolean>; // e.g. { vlan: 20, poe: true }
  links?: ExternalLink[];
}
```

The model uses the vocabulary of the IETF network topology model,
[RFC 8345](https://www.rfc-editor.org/rfc/rfc8345), so a topology can be read into and
out of tools that speak it without renaming anything's meaning:

| RFC 8345 | Scene |
|---|---|
| node | an object |
| termination point (`tp-id`) | a port |
| link (`source-node` + `source-tp`, `dest-node` + `dest-tp`) | a connection (`from` + `fromPort`, `to` + `toPort`) |

The fields keep the names `connections` and `ports` because `links` already means
[links back to external tools](#links-back-to-external-tools). RFC 8345 links are
directed; a connection is too, but only by which end is written first, and an editor
may draw it either way.

How a connection is **drawn** is up to each view: a diagram view draws it as a
connector, a plan view may draw it as a cable run or not at all. A view connector says
which connection it draws (see [Diagram views](#diagram-views-iso-and-schematic)).
A connector that draws no connection is only a line on that view.

## Links back to external tools

Any object, connection or scene can point back to the same thing in another tool: the
device's page in a remote-management console, its host in a network-monitoring console,
its port on a switch controller, a ticket. The format has **no field for any particular
product**. Every such link has the same shape:

```ts
interface ExternalLink {
  source: string;   // /^[a-z0-9][a-z0-9._-]{0,39}$/: names the tool, e.g. 'rmm', 'nsm', 'switch'
  ref?: string;     // max 200: that tool's own identifier for the thing, as the tool writes it
  url?: string;     // max 2000: an absolute http: or https: URL that opens it
  label?: string;   // max 100: link text; default is `source`
}
```

- **At least one of `ref` and `url` is required.** Some tools give a thing an id of its
  own (an agent id, an asset tag); some have none and find it by address or host name,
  so only a URL makes sense. Where a tool has both, store both: a URL breaks when the
  tool moves host, and the `ref` survives it.
- **`source` is free text**, chosen by whoever writes the scene. A new tool needs no
  change to the format. Use one value per tool, consistently, so links can be grouped.
- **Several links per thing, and several per source**, are allowed: a switch port and
  the switch it is on are both useful links for one device.
- **A link is never identity.** The scene finds its objects by their own `id`; nothing
  in the format depends on a link, and a link that has gone stale breaks only itself.
- **`url` must be `http:` or `https:`.** It is opened by a person clicking it, so
  `javascript:`, `data:`, `file:` and every other scheme are rejected.

```json
"links": [
  { "source": "rmm", "ref": "AbCdEf0123456789", "url": "https://rmm.example.com/agents/AbCdEf0123456789", "label": "RMM agent" },
  { "source": "nsm", "url": "https://nsm.example.com/#/hunt?q=10.0.20.14", "label": "Network monitoring" },
  { "source": "switch", "ref": "sw-core-1:24" }
]
```

## Views

```ts
type View = PlanView | DiagramView;

interface ViewBase {
  id: Id;
  name: string;           // max 100
  description?: string;   // max 1000
  lastUpdated?: string;   // ISO 8601 date-time
}
```

**An object appears at most once in a view.** So within a view, an object id is also
the id of its placement, and connectors and groups refer to placements by object id.

### Plan views

A plan view is a building: floors, walls, and objects placed at true scale. This is
Axonometra's view.

```ts
interface PlanView extends ViewBase {
  kind: 'plan';
  floors: Floor[];        // lowest first
  placements?: PlanPlacement[];
}

interface Floor {
  id: Id;
  name?: string;          // e.g. 'Ground', 'Level 2'
  elevationMm?: number;   // floor level above ground; default 3000 per storey below it
  wallHeightMm?: number;  // default 2700
  nodes?: WallNode[];     // wall corners
  walls?: Wall[];
}

interface WallNode { id: Id; x: number; y: number } // mm

interface Wall {
  id: Id;
  from: Id;               // a node id on this floor
  to: Id;                 // a node id on this floor
  exterior?: boolean;     // default false (interior, thinner)
  layer?: Id;
}

interface PlanPlacement {
  object: Id;
  floor: Id;
  x: number;              // mm: the centre of the footprint
  y: number;              // mm
  rotation?: number;      // degrees clockwise; default 0
  mirror?: { x?: boolean; y?: boolean }; // flips, e.g. a door's hinge side and swing
  mountMm?: number;       // underside above the floor; default the element's `mount`, else 0
  size?: { w?: number; d?: number; h?: number }; // mm; overrides the element's size
  attach?: { wall: Id };  // doors, windows and anything else fixed into a wall
  layer?: Id;
  symbol?: boolean;       // force the 400 mm plan symbol; default is the element's choice
}
```

- **Every length is stored in millimetres**, as an integer wherever the value allows,
  whatever the scene's `units` says. Accurona elements are authored in centimetres; an
  editor reads an element's `size` and `mount` x 10. **Axes:** x runs right, y runs down
  the plan, z runs up. **Rotation** is clockwise in degrees, about the footprint centre.
- **The footprint** is the element's `size.w` by `size.d`, unless `size` overrides it.
  An editor records the size it placed, as Axonometra does today, when the scene must
  not change if the element library does.
- **`attach`** fixes the placement into a wall of the same floor. The placement's `x`
  and `y` still say where along the wall it sits.

### Diagram views (`iso` and `schematic`)

A diagram view is a network drawing on a grid of tiles. `iso` draws the grid
isometrically, which is Reticulyne's view today; `schematic` draws the same grid
flat, with 2D symbols, in the style of a conventional network diagram. **The two
kinds share one shape**, so a diagram can be switched between them without losing
anything.

```ts
interface DiagramView extends ViewBase {
  kind: 'iso' | 'schematic';
  placements?: DiagramPlacement[];
  connectors?: Connector[];
  rectangles?: Rectangle[];
  textBoxes?: TextBox[];
  groups?: Group[];
}

interface Tile { x: number; y: number } // integers, -1000 to 1000

interface DiagramPlacement {
  object: Id;
  tile: Tile;
  labelHeight?: number;
  group?: Id;             // a group in this view
  layer?: Id;
  locked?: boolean;       // default false
}

interface Connector {
  id: Id;
  connection?: Id;        // the Connection this connector draws
  anchors: Anchor[];      // 2 to 100: the ends first and last, waypoints between
  description?: string;
  color?: Id;             // an entry in `colors`
  width?: number;
  style?: 'SOLID' | 'DOTTED' | 'DASHED';
  direction?: 'START_TO_END' | 'END_TO_START' | 'BOTH' | 'NONE';
  glyph?: string;         // one of Reticulyne's connector glyphs
  animated?: boolean;
  animationRate?: number; // 0 to 1
  animationFlow?: 'forward' | 'reverse' | 'both';
  layer?: Id;
  locked?: boolean;
}

// Exactly one of the three.
interface Anchor {
  id: Id;
  ref: { object: Id; side?: '+X' | '-X' | '+Y' | '-Y' } | { anchor: Id } | { tile: Tile };
}

interface Rectangle {
  id: Id;
  from: Tile;
  to: Tile;
  color?: Id;
  colorValue?: string;    // #rrggbb
  outlineColor?: string;  // #rrggbb
  transparency?: number;  // 0 to 1
  zIndex?: number;
  group?: Id;
  layer?: Id;
  locked?: boolean;
}

interface TextBox {
  id: Id;
  tile: Tile;
  content: string;        // max 100
  fontSize?: number;
  orientation?: 'X' | 'Y';
  group?: Id;
  layer?: Id;
  locked?: boolean;
}

interface Group {
  id: Id;
  name?: string;
  color?: string;         // #rrggbb, a faint fill behind the members
  group?: Id;             // groups nest; a cycle is invalid
  collapsed?: boolean;    // drawn as one box in place of its members; absent is expanded
}
```

- When a connector has a `connection`, its first and last anchors must reference that
  connection's `from` and `to` objects (in either order).
- An anchor on an object may name the `side` of the object's tile the connector leaves
  by: the edge facing the named grid direction (`+X` is the edge towards the tile at
  x + 1). It means the same edge in the iso and the flat view. Without it the end docks
  on the tile's centre and the route picks its own way out.
- A `locked` placement, connector, rectangle or text box is drawn as usual but an
  editor does not let it be selected on the canvas, so it cannot be moved, edited or
  deleted until it is unlocked. It is a view property, like `layer`: the same object
  can be locked in one view and not in another.
- Group membership lives on the member, not as a list on the group, as in Reticulyne:
  "the members of G" is a filter, and two people editing one diagram never race on one
  array.

## Layers

```ts
interface Layer {
  id: Id;
  name: string;           // max 100
  visible?: boolean;      // default true
}
```

A layer is scene-wide: one layer can hold walls on a plan and connectors in a diagram.
Anything without a `layer` is on the base layer, which always exists and is never
listed.

**`redacted` is a reserved layer id.** Anything on it is shown in an editor and left
out of every export (image, PDF, SVG, shared link, JSON) unless the export explicitly
opts in. It exists so a diagram can carry addresses and other sensitive notes in
the working copy without them leaking into the copy that gets sent out.
`redactScene(scene)` in `@accurona/core` gives that copy, still a valid scene: an object
whose every placement was redacted goes with it, as do the connections and connectors
that end on it, and a placement fixed into a redacted wall loses its `attach`.
`hasRedacted(scene)` says whether there is anything to leave out, so an editor can
offer the opt-in only when it means something.

## Icons and colours

```ts
interface Icon {
  id: Id;
  name: string;           // max 100
  url: string;            // max 65,536; see Validation for the allowed schemes
  collection?: string;
  isIsometric?: boolean;
}

interface Color { id: Id; value: string } // #rrggbb
```

These are Reticulyne's icon and colour entries unchanged.

## Writing a scene from code

The format is meant to be written by hand, by a script, and by a language model
describing a network in words. So:

- **Almost everything is optional.** The smallest valid scene is three fields and an
  empty list.
- **Placement is optional.** A scene can list objects and connections with no views at
  all; an editor opening it places the unplaced objects itself. An object that is in no
  view is still part of the scene.
- **Rotation is in degrees**, not radians, and **lengths are in millimetres**, because
  those are the numbers people write down and read off a drawing.
- **Ids can be readable.** `core-switch` is as good as a UUID.

### Smallest valid scene

```json
{ "format": "accurona-scene", "version": 1, "id": "empty", "objects": [] }
```

### A network with no drawing yet

```json
{
  "format": "accurona-scene",
  "version": 1,
  "id": "branch-office",
  "title": "Branch office",
  "objects": [
    { "id": "fw", "element": "firewall", "name": "Firewall" },
    { "id": "core", "element": "network-switch", "name": "Core switch", "ports": [{ "id": "1", "kind": "ethernet" }] },
    { "id": "ap-1", "element": "wifi-ap", "name": "AP reception" }
  ],
  "connections": [
    { "id": "c1", "from": "fw", "to": "core", "kind": "ethernet" },
    { "id": "c2", "from": "core", "fromPort": "1", "to": "ap-1", "kind": "ethernet", "props": { "poe": true } }
  ]
}
```

### A plan

One room, 4 m by 3 m (4000 by 3000 mm), with a door and a rack.

```json
{
  "format": "accurona-scene",
  "version": 1,
  "id": "comms-room",
  "objects": [
    { "id": "door-1", "element": "door" },
    { "id": "rack-1", "element": "rack-600x1000-42u", "name": "Rack A" }
  ],
  "views": [
    {
      "id": "plan",
      "kind": "plan",
      "name": "Floor plan",
      "floors": [
        {
          "id": "g",
          "name": "Ground",
          "nodes": [
            { "id": "n1", "x": 0, "y": 0 },
            { "id": "n2", "x": 4000, "y": 0 },
            { "id": "n3", "x": 4000, "y": 3000 },
            { "id": "n4", "x": 0, "y": 3000 }
          ],
          "walls": [
            { "id": "w1", "from": "n1", "to": "n2", "exterior": true },
            { "id": "w2", "from": "n2", "to": "n3", "exterior": true },
            { "id": "w3", "from": "n3", "to": "n4" },
            { "id": "w4", "from": "n4", "to": "n1", "exterior": true }
          ]
        }
      ],
      "placements": [
        { "object": "door-1", "floor": "g", "x": 3000, "y": 3000, "attach": { "wall": "w3" } },
        { "object": "rack-1", "floor": "g", "x": 600, "y": 600 }
      ]
    }
  ]
}
```

### The same device on a plan and in a diagram

The access point `ap-2e` is placed on the level 2 plan and in the network schematic.
The connector draws connection `c-ap`, so selecting the cable in the diagram can
highlight the device on the plan. The access point and the switch both link back to a
remote-management console and a network-monitoring console.

```json
{
  "format": "accurona-scene",
  "version": 1,
  "id": "hq",
  "title": "Head office",
  "objects": [
    {
      "id": "sw-2",
      "element": "network-switch",
      "name": "Level 2 switch",
      "props": { "ip": "10.0.20.2" },
      "ports": [{ "id": "14", "kind": "ethernet" }],
      "links": [
        { "source": "rmm", "ref": "Sw2AgentId0001", "url": "https://rmm.example.com/agents/Sw2AgentId0001" },
        { "source": "nsm", "url": "https://nsm.example.com/#/hunt?q=10.0.20.2" }
      ]
    },
    {
      "id": "ap-2e",
      "element": "wifi-ap",
      "name": "AP level 2 east",
      "props": { "ip": "10.0.20.14", "serial": "Q2XX-0000-0001" },
      "links": [
        { "source": "rmm", "ref": "Ap2eAgentId001", "url": "https://rmm.example.com/agents/Ap2eAgentId001" },
        { "source": "nsm", "url": "https://nsm.example.com/#/hunt?q=10.0.20.14" },
        { "source": "switch", "ref": "sw-2:14" }
      ]
    }
  ],
  "connections": [
    { "id": "c-ap", "from": "sw-2", "fromPort": "14", "to": "ap-2e", "kind": "ethernet", "props": { "poe": true } }
  ],
  "views": [
    {
      "id": "plan",
      "kind": "plan",
      "name": "Building",
      "floors": [{ "id": "l2", "name": "Level 2", "elevationMm": 3500 }],
      "placements": [
        { "object": "sw-2", "floor": "l2", "x": 1200, "y": 800 },
        { "object": "ap-2e", "floor": "l2", "x": 18400, "y": 6200, "mountMm": 2700 }
      ]
    },
    {
      "id": "net",
      "kind": "schematic",
      "name": "Network",
      "placements": [
        { "object": "sw-2", "tile": { "x": 0, "y": 0 } },
        { "object": "ap-2e", "tile": { "x": 4, "y": 0 } }
      ],
      "connectors": [
        {
          "id": "k1",
          "connection": "c-ap",
          "anchors": [
            { "id": "a1", "ref": { "object": "sw-2" } },
            { "id": "a2", "ref": { "object": "ap-2e" } }
          ]
        }
      ]
    }
  ]
}
```

## Crossover: one object in both editors

Axonometra draws the plan views and Reticulyne the diagram views of one scene, and
each keeps the other's views when it saves. An object placed in both is linked by
its `id` and by nothing else, so the links are read straight out of the scene.
`@accurona/core` reads them for both editors:

```ts
objectPlaces(scene, objectId): ObjectPlace[]
// every view that places the object: its plan floor and position, or its tile

placedOnlyElsewhere(scene, kinds): SceneObject[]
// objects placed in a view of another kind and in no view of `kinds`:
// what one editor can offer to place from the other's drawing

diagramLocations(scene, diagramViewId): FloorLocation[]
// where a diagram view is on the building: the plan floors its objects
// are on, most objects first

floorsOf(scene, objectIds): FloorLocation[]
// the same for any set of objects, such as a diagram view not saved yet
```

- **Placing an object from the other editor keeps its `id`.** It is the same thing,
  now drawn twice; a copy with a new id would be a second thing.
- **A diagram view is not tied to a floor by a field.** Its physical location is
  where its objects are: a diagram per storey maps to that storey, a diagram of a
  whole site maps to several floors, and a diagram of cloud services maps to none.
  Nothing has to be kept in step when a device moves floor.
- **At catalogue level** the two libraries relate by the free-form cross-reference
  (an entry in Reticulyne's catalogue linking `{ source: 'accurona', ref: '<element
  id>' }`), so a plan object with an `element` can be drawn in a diagram with its
  Reticulyne twin. The scene never stores that cross-reference.

## Migrating from today's formats

The scene format replaces the formats each project uses today: Axonometra's plan
format (version 2), Reticulyne's model, and Accurona's own JSON and SVG output for
drawings. The old formats are **read, never written**:

- **On load**, an editor that is given a plan v2 file or a Reticulyne model converts
  it to a scene as below, and from then on works on the scene.
- **On save**, it writes only the scene format. There is no "save as plan v2" or "save
  as Reticulyne model", and no round trip back to either.
- **Exports are separate and unchanged.** Exporting a drawing as SVG, PDF or PNG is
  output, not a file format, and works as it does today.

### Axonometra plan (version 2)

The plan format is described in Axonometra's
[PLAN-FORMAT.md](https://github.com/qant-au/axonometra/blob/main/PLAN-FORMAT.md). A
plan becomes one scene with one `plan` view.

| Axonometra | Scene | Note |
|---|---|---|
| `floors[i]` | `views[0].floors[i]` | `id` generated (`floor-0`, `floor-1`...), since Axonometra floors have none |
| `wallNodes[].id` (number) | `nodes[].id` (string) | the number as a string |
| `wallNodes[].x`, `.y` | `nodes[].x`, `.y` | x 10: Axonometra editor units are cm |
| `wallNodeLinks` (adjacency list) | `walls[]` | one wall per unordered node pair; `id` = `w-<a>-<b>` with `a < b` |
| `exteriorWalls` | `walls[].exterior` | |
| `wallHeightM`, `elevationM` | `wallHeightMm`, `elevationMm` | x 1000 |
| `furnitureArray[]` | one object + one placement each | object `id` = the furniture id as a string |
| `texturePath` | `objects[].element` | it is already the Accurona element id, or a built-in wall fitting such as `door` |
| `width`, `height` (m) | `placements[].size.w`, `.d` (mm) | x 1000; Axonometra's `height` is depth, not how tall |
| `heightM`, `mountM` | `size.h`, `mountMm` | x 1000 |
| `x`, `y` | `x`, `y` | Axonometra stores the footprint's top-left corner, which is also the point it rotates about; the centre is that point plus the half-size rotated by `rotation`. Doors are also offset by the wall thickness at orientations 1 and 3, and the converter undoes it |
| `rotation` (radians) | `rotation` (degrees) | x 180 / pi; both clockwise |
| `orientation` 0 / 1 / 2 / 3 | `mirror` none / `{x}` / `{x, y}` / `{y}` | each step flips one axis in place |
| `attachedToLeft`, `attachedToRight` | `attach.wall` | the wall between the two nodes |
| `zIndex` | none | derived from mount height and placement order when drawn |
| `furnitureId`, `wallNodeId` counters | none | ids are strings; an editor keeps its own counters |
| `units` | `units` | unchanged; absent is `mm` in both |

### Reticulyne model

The Reticulyne model schema is in
[src/schemas](https://github.com/qant-au/reticulyne/tree/main/src/schemas). A model
becomes one scene with one `iso` view per Reticulyne view.

| Reticulyne | Scene | Note |
|---|---|---|
| `title`, `description` | `title`, `description` | |
| `items[]` (`id`, `name`, `description`, `icon`) | `objects[]` | same ids; `icon` stays an icon reference |
| `icons[]`, `colors[]` | `icons[]`, `colors[]` | unchanged |
| `views[]` | `views[]` with `kind: 'iso'` | |
| view `items[]` (`id`, `tile`, `labelHeight`, `parentGroupId`) | `placements[]` (`object`, `tile`, `labelHeight`, `group`) | a view item's `id` is its model item's id |
| `connectors[]` | `connectors[]` | anchor `ref.item` becomes `ref.object`; no `connection` |
| `rectangles[]`, `textBoxes[]`, `groups[]` | same | `parentGroupId` becomes `group` |
| `version` (string) | none | the scene carries its own `version` |

Reticulyne connectors carry no logical connection today. On load, a connector
whose two ends are objects may also create a `Connection` between them; an editor
that does so must do it only when asked, since two connectors between the same pair
are not necessarily two cables.

## Validation

An editor never calls `JSON.parse` on a scene without a reviver that drops
`__proto__`, `constructor` and `prototype` keys, and validates the result before using
it. A scene that fails validation is refused whole; nothing is half-loaded.

**Structure.** Unknown keys are rejected at every level (so a typo fails loudly rather
than being dropped), and every string length and array size is capped:

| Collection | Max |
|---|---|
| objects, connections | 10,000 |
| views | 1,000 |
| placements per view | 10,000 |
| connectors, rectangles, text boxes, groups per view | 5,000 each |
| anchors per connector | 100 |
| floors per plan | 200 |
| nodes, walls per floor | 10,000 each |
| layers | 100 |
| icons | 5,000 |
| colors | 100 |
| ports per object | 1,000 |
| links per object, port, connection or scene | 20 |

**Coordinates.** Diagram tiles are integers from -1000 to 1000 (a pathfinder allocates
a grid the size of the area a connector spans). Plan coordinates and lengths are finite
numbers in millimetres from -10,000,000 to 10,000,000 (10 km).

**URLs.** An icon `url` may be `http:`, `https:`, `blob:`, a relative path, or a
`data:image/` URI of type png, jpeg, gif, webp or svg+xml. An external link `url` must
be `http:` or `https:`. Everything else is rejected, percent-encoded schemes included.

**References.** Every id reference must resolve:

- a connection's `from` and `to`, and a placement's `object`, to an object, and a
  connection's `fromPort` and `toPort` to a port of that end's object;
- a plan placement's `floor` to a floor of that view, and `attach.wall` to a wall of
  that floor;
- a wall's `from` and `to` to nodes of the same floor;
- a connector anchor's `object` to an object placed in that view, and `anchor` to
  another anchor of a connector in that view;
- a `group` to a group in the same view, with no cycles;
- a `color` to `colors`, an `icon` to `icons`, a `layer` to `layers` or `redacted`;
- a connector's `connection` to a connection whose ends match its end anchors.

And no object is placed twice in one view.

## Versioning

- `version` is a single integer. This document is version 1. The Zod schema in
  `@accurona/core` and the JSON Schema generated from it are published per version
  (`scene-v1.json`), so a file's `$schema` keeps pointing at the schema it was written
  against.
- A new required field, a removed field, or a change to what a field means bumps the
  version, and adds a forward-only migration from the previous version.
- A new optional field, whose absence means the old behaviour, needs no migration, but
  still bumps the version, so that an older reader refuses the file rather than
  silently dropping the field.
- Migrations are append-only: never edit a released one.
- Readers accept every version they have a migration for, and refuse anything newer.

## Out of scope

- **Editor state**: selection, tool, zoom, scroll position. A scene describes the
  drawing, not a session.
- **The element library itself.** A scene refers to elements by id; their shapes,
  sizes and drawings come from Accurona.
- **Anything product-specific.** Links to other tools are generic
  ([Links back to external tools](#links-back-to-external-tools)); a tool that wants
  more stores it in `props`.
- **Importing other formats.** The scene format is the native format; reading a
  building or diagram from another standard (IFC, glTF, GraphML, draw.io) is not part of
  it, and exporting a drawing (SVG, PDF, PNG) is separate from it.
