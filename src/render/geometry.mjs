// Shared helpers for turning part geometry into SVG.

export const f = (n) => +n.toFixed(2);
export const pts = (a) => a.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

export function ellipsePts(cx, cy, rx, ry, n = 32, from = 0, to = 2 * Math.PI) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    out.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
  }
  return out;
}

/** Axis-aligned bounds of a part, in cm (x right, y towards the front, z up). */
export function bounds(p) {
  const round = p.cyl ?? p.dome;
  if (round) {
    const [cx, cy, rx, ryIn] = round;
    const ry = ryIn ?? rx;
    return {
      x: cx - rx,
      y: cy - ry,
      z: p.z ?? 0,
      w: 2 * rx,
      d: 2 * ry,
      h: p.h
    };
  }
  if (p.poly) {
    const xs = p.poly.map((q) => q[0]);
    const ys = p.poly.map((q) => q[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
      x,
      y,
      z: p.z ?? 0,
      w: Math.max(...xs) - x,
      d: Math.max(...ys) - y,
      h: p.h
    };
  }
  return { x: p.x, y: p.y, z: p.z ?? 0, w: p.w, d: p.d, h: p.h };
}
