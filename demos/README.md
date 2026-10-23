# Demos

The animated GIFs in [`docs/demos`](../docs/demos) are recorded from the hull viewer itself
([`frontend/src/hull/viewer.ts`](../frontend/src/hull/viewer.ts), `hulls.html` in the standalone build), by
[`hulls.mjs`](hulls.mjs). Nothing is drawn for the recording: each GIF is the viewer showing a hull from its
catalogue, turned a full circle on the water.

| Recording | What it shows |
|---|---|
| `hull-sailing-yacht-10m-keel` | A 10 m sailing yacht's canoe body, with a fin keel, its bulb and a spade rudder |
| `hull-rib-6.5m-with-tube` | A 6.5 m RIB: its deep-V hull and the 0.5 m tube that sits on it |
| `hull-catamaran-12m` | A 12 m cruising catamaran: two demihulls 5.2 m apart |
| `hull-swath-25m` | A 25 m SWATH: two submerged hulls under thin struts |
| `hull-container-ship-300m` | A 300 m container ship with its bulbous bow |

These are previews of the hull work: hull shapes and what is fixed to them, floating on the water. Decks, rooms,
equipment and live data come later.

## Recording

```sh
cd frontend && npm run build && node ../fork/build-standalone.mjs
node ../demos/hulls.mjs                  # every recording
node ../demos/hulls.mjs catamaran-12m    # one of them
```

The script serves `dist/standalone`, opens `hulls.html?bare` (the 3D view alone, with the hull's name and note) in
a headless Chrome at 800 x 450, and renders the turn one frame at a time, so the motion is exactly even whatever
the machine. A turn takes 12 seconds (a comfortable 6, played at half speed) at 15 frames a second. The frames
become a GIF with `ffmpeg`, and `gifsicle` shrinks it when it is installed. The hulls, the camera's height above
the water for each, and the timing are set at the top of [`hulls.mjs`](hulls.mjs); `CHROME_PATH` overrides the
browser.
