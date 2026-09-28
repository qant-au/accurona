// Isometric view (Reticulyne). EXPERIMENTAL: the element set is modelled for
// it, but the output has not been reviewed item by item yet. Faces are shaded
// by orientation: top lightest, front (+y) mid, side (+x) darkest.
import { OUTLINE, DETAIL, fillFor } from '../palette.mjs';
import { bounds, ellipsePts, f, pts } from './geometry.mjs';

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const iso = ([x, y, z]) => [(x - y) * C, (x + y) * S - z];
const TONE = { top: 1, front: 0.86, side: 0.72 };

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  return (
    '#' +
    [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v * k)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

const forIso = (dc) => dc.view !== 'plan';

// Face-local (u across, v down from the face's top edge) to world.
function facePoint(b, face, u, v) {
  if (face === 'top') return [b.x + u, b.y + v, b.z + b.h];
  if (face === 'front') return [b.x + u, b.y + b.d, b.z + b.h - v];
  return [b.x + b.w, b.y + u, b.z + b.h - v];
}

function decal(dc, b, face, sd) {
  const colour = dc.accent
    ? fillFor(dc.accent)
    : dc.stroke
      ? fillFor(dc.stroke)
      : DETAIL;
  const fill = dc.fill ? fillFor(dc.fill) : dc.accent ? colour : 'none';
  const stroke = dc.accent && !dc.stroke ? 'none' : colour;
  const map = (a) => a.map(([u, v]) => iso(facePoint(b, face, u, v)));
  let shape;
  if (dc.line) shape = dc.line;
  else if (dc.rect) {
    const [u, v, w, h] = dc.rect;
    shape = [
      [u, v],
      [u + w, v],
      [u + w, v + h],
      [u, v + h],
      [u, v]
    ];
  } else if (dc.circle)
    shape = ellipsePts(dc.circle[0], dc.circle[1], dc.circle[2], dc.circle[2]);
  else if (dc.ellipse) shape = ellipsePts(...dc.ellipse);
  else if (dc.arc) {
    const [cx, cy, r, a0, a1] = dc.arc;
    shape = ellipsePts(
      cx,
      cy,
      r,
      r,
      24,
      (a0 * Math.PI) / 180,
      (a1 * Math.PI) / 180
    );
  } else return '';
  const closed = !dc.line || dc.closed;
  const tag = closed ? 'polygon' : 'polyline';
  return `<${tag} points="${pts(map(shape))}" fill="${closed ? fill : 'none'}" stroke="${closed ? stroke : colour}" stroke-width="${f(sd)}"/>`;
}

function face(points, colour, so) {
  return `<polygon points="${pts(points.map(iso))}" fill="${colour}" stroke="${OUTLINE}" stroke-width="${f(so)}"/>`;
}

function box(p, so, sd) {
  const b = bounds(p);
  const { x, y, z, w, d, h } = b;
  const [X, Y, Z] = [x + w, y + d, z + h];
  const base = fillFor(p.role ?? 'body');
  const faces = {
    front: [
      [x, Y, Z],
      [X, Y, Z],
      [X, Y, z],
      [x, Y, z]
    ],
    side: [
      [X, y, Z],
      [X, Y, Z],
      [X, Y, z],
      [X, y, z]
    ],
    top: [
      [x, y, Z],
      [X, y, Z],
      [X, Y, Z],
      [x, Y, Z]
    ]
  };
  let out = '';
  for (const name of ['front', 'side', 'top']) {
    out += face(faces[name], shade(base, TONE[name]), so);
    for (const dc of (p[name] ?? []).filter(forIso))
      out += decal(dc, b, name, sd);
  }
  return out;
}

// An extruded polygon: side walls facing the viewer, back to front, then the top.
function prism(p, so, sd) {
  const b = bounds(p);
  const z0 = b.z;
  const z1 = b.z + b.h;
  const base = fillFor(p.role ?? 'body');
  const ring = p.poly;
  const walls = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const c = ring[(i + 1) % ring.length];
    // Outward normal for a clockwise ring in y-down plan space.
    const nx = c[1] - a[1];
    const ny = a[0] - c[0];
    if (nx + ny <= 0) continue; // faces away from the viewer
    const tone = Math.abs(nx) > Math.abs(ny) ? TONE.side : TONE.front;
    walls.push({
      depth: a[0] + a[1] + c[0] + c[1],
      pts: [
        [a[0], a[1], z1],
        [c[0], c[1], z1],
        [c[0], c[1], z0],
        [a[0], a[1], z0]
      ],
      tone
    });
  }
  walls.sort((m, n) => m.depth - n.depth);
  let out = walls.map((w) => face(w.pts, shade(base, w.tone), so)).join('');
  out += face(
    ring.map(([x, y]) => [x, y, z1]),
    shade(base, TONE.top),
    so
  );
  for (const dc of (p.top ?? []).filter(forIso)) out += decal(dc, b, 'top', sd);
  return out;
}

function cylinder(p, so, sd) {
  const b = bounds(p);
  const [cx, cy, rx, ryIn] = p.cyl;
  const ry = ryIn ?? rx;
  const base = fillFor(p.role ?? 'body');
  const ring = (z) =>
    ellipsePts(cx, cy, rx, ry, 48).map(([x, y]) => iso([x, y, z]));
  const cBot = iso([cx, cy, b.z])[1];
  const cTop = iso([cx, cy, b.z + b.h])[1];
  const lower = ring(b.z)
    .filter((q) => q[1] >= cBot - 1e-6)
    .sort((m, n) => m[0] - n[0]);
  const upper = ring(b.z + b.h)
    .filter((q) => q[1] >= cTop - 1e-6)
    .sort((m, n) => n[0] - m[0]);
  let out = `<polygon points="${pts([...lower, ...upper])}" fill="${shade(base, TONE.front)}" stroke="${OUTLINE}" stroke-width="${f(so)}"/>`;
  out += `<polygon points="${pts(ring(b.z + b.h))}" fill="${shade(base, TONE.top)}" stroke="${OUTLINE}" stroke-width="${f(so)}"/>`;
  for (const dc of (p.top ?? []).filter(forIso)) out += decal(dc, b, 'top', sd);
  return out;
}

function dome(p, so) {
  const b = bounds(p);
  const [cx, cy, r] = p.dome;
  const base = fillFor(p.role ?? 'body');
  const c = iso([cx, cy, b.z]);
  const lower = ellipsePts(cx, cy, r, r, 48)
    .map(([x, y]) => iso([x, y, b.z]))
    .filter((q) => q[1] >= c[1] - 1e-6)
    .sort((m, n) => m[0] - n[0]);
  const arc = ellipsePts(c[0], c[1], r * C, b.h, 32, 0, -Math.PI);
  return (
    `<polygon points="${pts([...lower, ...arc])}" fill="${shade(base, TONE.front)}" stroke="${OUTLINE}" stroke-width="${f(so)}"/>` +
    `<ellipse cx="${f(c[0] - r * C * 0.3)}" cy="${f(c[1] - b.h * 0.55)}" rx="${f(r * C * 0.25)}" ry="${f(b.h * 0.18)}" fill="#fff" fill-opacity="0.5"/>`
  );
}

// Painter's order for non-intersecting parts: A draws before B when A lies
// wholly behind (smaller x or y) or below B on some axis.
function paintOrder(parts) {
  const b = parts.map(bounds);
  const behind = (i, j) =>
    b[i].x + b[i].w <= b[j].x + 1e-6 ||
    b[i].y + b[i].d <= b[j].y + 1e-6 ||
    b[i].z + b[i].h <= b[j].z + 1e-6;
  const order = [];
  const left = new Set(parts.map((_, i) => i));
  while (left.size) {
    const rest = [...left];
    let pick = rest.find((i) =>
      rest.every((j) => j === i || !behind(j, i) || behind(i, j))
    );
    if (pick === undefined)
      pick = rest.sort(
        (i, j) => b[i].x + b[i].y + b[i].z - (b[j].x + b[j].y + b[j].z)
      )[0];
    order.push(parts[pick]);
    left.delete(pick);
  }
  return order;
}

export function isoSvg(el) {
  const { w, d, h } = el.size;
  // Strokes scale with the drawing so every icon has the same line weight.
  const extent = Math.max((w + d) * C, (w + d) * S + h);
  const so = extent / 90;
  const sd = extent / 180;
  const off = extent * 0.03;
  const shadow = [
    [0, 0],
    [w, 0],
    [w, d],
    [0, d]
  ].map(([x, y]) => iso([x + off, y + off, 0]));
  let body = `<polygon points="${pts(shadow)}" fill="#000" fill-opacity="0.12"/>`;
  const all = [...shadow];
  for (const p of paintOrder(el.parts)) {
    body += p.dome
      ? dome(p, so)
      : p.cyl
        ? cylinder(p, so, sd)
        : p.poly
          ? prism(p, so, sd)
          : box(p, so, sd);
    const bb = bounds(p);
    for (const x of [bb.x, bb.x + bb.w])
      for (const y of [bb.y, bb.y + bb.d])
        for (const z of [bb.z, bb.z + bb.h]) all.push(iso([x, y, z]));
  }
  const xs = all.map((q) => q[0]);
  const ys = all.map((q) => q[1]);
  const pad = so * 2;
  const vb = [
    Math.min(...xs) - pad,
    Math.min(...ys) - pad,
    Math.max(...xs) - Math.min(...xs) + 2 * pad,
    Math.max(...ys) - Math.min(...ys) + 2 * pad
  ].map(f);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" stroke-linejoin="round" stroke-linecap="round">${body}</svg>\n`;
}
