# Contributing to Accurona

Thanks for your interest in Accurona, the open-source shared element library behind Axonometra and Reticulyne. It is pre-1.0, so expect breaking
changes between minor versions.

## Ground rules

- Be civil. Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
- Security issues go to private vulnerability reporting, never a public issue. See
  [SECURITY.md](SECURITY.md).
- Everything else goes in [issues](https://github.com/qant-au/accurona/issues): bug reports,
  feature requests and questions alike.
- For anything substantial, open an issue first so we can agree on the scope before you
  write code.

## Development setup

```bash
git clone https://github.com/qant-au/accurona.git
cd accurona
npm ci
npm run build            # dist/manifest.json, dist/models.json, dist/plan/, dist/iso/ and dist/schematic/ SVGs
npm run sheet            # review/<group>.png contact sheets for checking your change
```

## Checks before opening a pull request

```bash
npm test                 # the rules every element must meet
npm run build            # the build must succeed with no warnings
```

Look at the contact sheet for any group you changed (`npm run sheet -- <group>`) before
opening the pull request.

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/),
`<type>(<scope>): <subject>`, where the scope is the area of the code you changed:

```
feat(comms): add a 6U wall-mount rack
fix(security): point the camera symbol at the front
docs(readme): explain symbol frames
```

Keep each commit to one logical change.

## Pull request process

1. Fork the repo and branch off `main` (`feature/`, `fix/`, `docs/` or `chore/`).
2. Make your change, with tests where it makes sense.
3. Run the checks above.
4. Open the pull request and link the issue it addresses (`Closes #123`).
5. Expect at least one round of review.
6. Pull requests are squash-merged, with a Conventional Commits message.

## Where things live

- `src/elements/<group>.mjs` - the elements of one group.
- `src/groups.mjs` - the groups, in display order; `src/palette.mjs` - colours and line weights.
- `src/render/` - the plan, isometric and schematic renderers, and the 3D model.
- `ITEMS.md` - the item list: ids, names and sizes to build from.
- `packages/core/`, `packages/ui/` - `@accurona/core` and `@accurona/ui`, each with its own tests.
- `test/` - the rules every element must meet; `dist/` - the generated output, committed for consumers.

## Adding or changing an element

Follow the element format and house style in the [README](README.md): real sizes in
centimetres, 5 to 25 marks per plan, colour only in one small place, and one function
for a family of sizes. An element's `id` never changes once it has shipped.

## Licence

MIT. See [LICENSE](LICENSE).
