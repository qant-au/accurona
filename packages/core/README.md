# @accurona/core

The framework-free core shared by [Axonometra](https://github.com/qant-au/axonometra)
(floor plans) and [Reticulyne](https://github.com/qant-au/reticulyne) (network
diagrams): the **scene format** both save their files in, and **length units**.

```sh
npm install @accurona/core
```

## The scene format

One file for a building's floor plans and its network diagrams: the things in it
(objects, with one stable id each), how they are connected, and the views that
draw them. The full specification is
[docs/scene-format.md](https://github.com/qant-au/accurona/blob/main/docs/scene-format.md).

```ts
import { parseScene, serializeScene, checkReferences } from '@accurona/core';

const result = parseScene(text); // validates against the schema
if (result.ok) {
  const problems = checkReferences(result.scene); // ids that point nowhere
  const saved = serializeScene(result.scene);
} else {
  console.error(result.errors);
}
```

The schema is a [Zod](https://zod.dev) schema (`sceneSchema`) with a JSON Schema
generated from it, for validating a scene in any language:

- in this package: `@accurona/core/schema/scene-v1.json`
- online: <https://cdn.jsdelivr.net/npm/@accurona/core@0/schema/scene-v1.json>, the
  `$schema` every saved scene names

## Length units

Every length in a scene is whole millimetres. Units only change how a length is
shown and typed:

```ts
import { formatLength, parseLength } from '@accurona/core';

formatLength(2700, 'm'); // '2.7 m'
formatLength(2700, 'ft-in'); // `8'10-5/16"`
parseLength(`8' 10"`, 'mm'); // 2692
parseLength('270', 'cm'); // 2700 (a bare number is in the unit given)
```

Units: `mm`, `cm`, `m`, `in` and `ft-in`.

## Also here

`keymapFor(tool)` and `resolveAction()`: the keyboard shortcuts both editors share
([docs/keymap.md](https://github.com/qant-au/accurona/blob/main/docs/keymap.md)).

## License

MIT
