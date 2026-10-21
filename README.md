<p align="center">
  <img src="assets/social-preview.png" alt="Accurona: one plan, land or water. The open-source 3D planning engine." width="720">
</p>

# Accurona

Accurona is an open-source 3D planning engine. You draw a plan at true scale and see it
in 3D, and the same engine is being built to handle boats as well as buildings: a house
plan on land, or a hull, its decks and its equipment on the water.

It is an intentionally maintained fork of [NeonPlan 3D](https://github.com/Mastershort/neonplan3d)
by Mastershort (MIT). Upstream releases are merged in on a schedule, and there is no plan
to merge Accurona back: it is going somewhere a house-planning project would not carry.
See [NOTICE](NOTICE) for the credit and [LICENSE](LICENSE) for the terms.

## Status

Early. Today Accurona is NeonPlan 3D 1.23.1 under its own name, as a Home Assistant
integration that installs **beside** NeonPlan 3D without either one touching the other:
its own integration domain (`accurona`), panel, card, custom elements, storage and static
path.

What stays compatible with NeonPlan 3D:

- **Plans and backups** move between the two in both directions (same file formats).
- **Furniture packs** (`.fp3dpack`) signed by Mastershort load and are checked the same way.

## Where it is going

1. **An engine without Home Assistant.** The plan model, editor and 3D viewer as an
   embeddable package with its own API, so other hosts can use it. Home Assistant becomes
   one optional host.
2. **A Signal K Server plugin first.** Signal K is the open data standard on many boats,
   and its server installs plugins from its own app store. The plugin is the first host
   after Home Assistant.
3. **Accurate hulls.** A hull interface built on cross-sections at stations, then a
   library of real hull families (fin-keel sloop, semi-displacement and planing
   cruisers, RIB, catamaran, launch) that you adjust to your own boat's measurements.
4. **A first-run wizard.** Read the boat's details from the Signal K server (name,
   length, beam, draft, tanks, engines, batteries), pick a hull, confirm the equipment,
   and land on your boat on the water in 3D. The wizard writes an ordinary plan that the
   editor then refines.

## Install (Home Assistant)

Accurona is not yet published to HACS. Until it is, add this repository to HACS as a
custom repository (type: integration), or copy `custom_components/accurona` into your
Home Assistant configuration. The upstream manual covers the editor itself:
[docs/manual.md](docs/manual.md).

## Development

- Frontend in `frontend/` (Lit 3, TypeScript, three.js): `npm ci`, then `npm test`,
  `npm run typecheck`, `npm run build`. The built bundles are committed under
  `custom_components/accurona/frontend/`, and CI fails when they are stale.
- Home Assistant integration in `custom_components/accurona/` (Python 3.13):
  `pip install -r requirements_test.txt ruff mypy`, then `pytest -q`, `ruff check`,
  `ruff format --check`, `mypy custom_components/accurona`.
- The fork's own tooling is in [`fork/`](fork/). The rename from upstream's identity is
  a script, [`fork/identity.py`](fork/identity.py), re-run after every upstream merge.

## Licence

MIT. Copyright (c) 2026 Adam Burgess, and Copyright (c) 2026 Mastershort for NeonPlan 3D,
on which Accurona is based.
