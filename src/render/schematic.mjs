// 2D schematic view (Reticulyne's flat, Visio-style diagrams). Not to scale:
// every drawing has the same line weight whatever the element's size, and a
// consumer scales it to its node. Generated from the model like every view:
// - a ceiling or wall device (`symbol`) draws its plan pictogram, the
//   conventional schematic sign for detectors, cameras and access points;
// - anything else is seen from the front: each solid's outline in x and z,
//   back to front, with the decals on its front face (ports, LEDs, bezels);
// - an element whose telling face is its top (a desk phone's keypad) sets
//   `schematic: 'plan'` and draws its top-down view instead.
import { DETAIL, OUTLINE, SYMBOL_SIZE, fillFor } from '../palette.mjs';
import { bounds, ellipsePts, f, pts } from './geometry.mjs';
import { planBody, symbolBody } from './plan.mjs';

const forSchematic = (dc) => dc.view !== 'plan';

// Face-local (u across, v down from the part's top edge) to drawing space:
// x to the right, y down from the element's top (z = h).
const at = (b, H) => (u, v) => [b.x + u, H - (b.z + b.h) + v];

function decal(dc, map, sd) {
  const colour = dc.accent
    ? fillFor(dc.accent)
    : dc.stroke
      ? fillFor(dc.stroke)
      : DETAIL;
  const fill = dc.fill ? fillFor(dc.fill) : dc.accent ? colour : 'none';
  const stroke = dc.accent && !dc.stroke ? 'none' : colour;
  const width = dc.weight === 'outline' ? sd * 2 : sd;
  const dash = dc.dash ? ` stroke-dasharray="${dc.dash}"` : '';
  const paint = `fill="${fill}" stroke="${stroke}" stroke-width="${f(width)}"${dash}`;
  if (dc.line) {
    const tag = dc.closed ? 'polygon' : 'polyline';
    const line = dc.line.map(([u, v]) => map(u, v));
    return `<${tag} points="${pts(line)}" fill="${dc.closed ? fill : 'none'}" stroke="${colour}" stroke-width="${f(width)}"${dash}/>`;
  }
  if (dc.rect) {
    const [u, v, w, h] = dc.rect;
    const [x, y] = map(u, v);
    return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${dc.r ?? 0}" ${paint}/>`;
  }
  if (dc.circle) {
    const [x, y] = map(dc.circle[0], dc.circle[1]);
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(dc.circle[2])}" ${paint}/>`;
  }
  if (dc.ellipse) {
    const [u, v, rx, ry] = dc.ellipse;
    const [x, y] = map(u, v);
    return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" ${paint}/>`;
  }
  if (dc.arc) {
    const [cx, cy, r, a0, a1] = dc.arc;
    const a = ellipsePts(
      cx,
      cy,
      r,
      r,
      24,
      (a0 * Math.PI) / 180,
      (a1 * Math.PI) / 180
    );
    return `<polyline points="${pts(a.map(([u, v]) => map(u, v)))}" fill="none" stroke="${colour}" stroke-width="${f(width)}"${dash}/>`;
  }
  throw new Error(`unknown decal ${JSON.stringify(dc)}`);
}

// One solid seen from the front: a dome is a half ellipse, anything else the
// rectangle of its x and z extent.
function solid(p, H, so, sd) {
  const b = bounds(p);
  const fill = fillFor(p.role ?? 'body');
  const top = H - (b.z + b.h);
  const paint = `fill="${fill}" stroke="${OUTLINE}" stroke-width="${f(so)}"`;
  let out;
  if (p.dome) {
    const c = [b.x + b.w / 2, H - b.z];
    const arc = ellipsePts(c[0], c[1], b.w / 2, b.h, 32, Math.PI, 2 * Math.PI);
    out = `<polygon points="${pts(arc)}" ${paint}/>`;
  } else {
    const r = Math.min(p.r ?? 0, b.w / 2, b.h / 2);
    out = `<rect x="${f(b.x)}" y="${f(top)}" width="${f(b.w)}" height="${f(b.h)}" rx="${f(r)}" ${paint}/>`;
  }
  // A box's front face carries its decals; other solids have no flat front.
  if (!p.cyl && !p.dome && !p.poly)
    for (const dc of (p.front ?? []).filter(forSchematic))
      out += decal(dc, at(b, H), sd);
  return out;
}

function frontSvg(el) {
  const { w, h } = el.size;
  // Strokes scale with the drawing so every symbol has the same line weight.
  const extent = Math.max(w, h);
  const so = extent / 60;
  const sd = extent / 120;
  // Back to front: what is nearer the viewer (larger y + d) is drawn last.
  const parts = el.parts
    .map((p, i) => ({ p, i, b: bounds(p) }))
    .sort((m, n) => m.b.y + m.b.d - (n.b.y + n.b.d) || m.i - n.i);
  const body = parts.map(({ p }) => solid(p, h, so, sd));
  const pad = so * 2;
  const vb = [-pad, -pad, w + 2 * pad, h + 2 * pad].map(f);
  return wrap(vb, body);
}

function wrap(vb, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" stroke-linejoin="round" stroke-linecap="round">${body.join('')}</svg>\n`;
}

export function schematicSvg(el) {
  if (el.symbol) {
    const pad = 1;
    return wrap(
      [-pad, -pad, SYMBOL_SIZE + 2 * pad, SYMBOL_SIZE + 2 * pad],
      symbolBody(el)
    );
  }
  if (el.schematic === 'plan') {
    const { w, d } = el.size;
    const extent = Math.max(w, d);
    const pad = extent / 30;
    return wrap(
      [-pad, -pad, w + 2 * pad, d + 2 * pad].map(f),
      planBody(el, [extent / 60, extent / 120])
    );
  }
  return frontSvg(el);
}
