// Length units. Every length in a scene is stored in millimetres (see
// docs/scene-format.md, Plan views); units only change how a length is shown
// and typed. Imperial units come later and are not handled here.

export type MetricUnit = 'mm' | 'cm' | 'm';

export const METRIC_UNITS: readonly MetricUnit[] = ['mm', 'cm', 'm'];

const MM_PER: Record<MetricUnit, number> = { mm: 1, cm: 10, m: 1000 };

// The finest step each unit shows, as decimal places: 1 mm in every unit.
const DECIMALS: Record<MetricUnit, number> = { mm: 0, cm: 1, m: 3 };

/** A stored millimetre value expressed in `unit`. */
export function fromMm(mm: number, unit: MetricUnit): number {
  return mm / MM_PER[unit];
}

/** A value in `unit` as whole millimetres, the form a scene stores. */
export function toMm(value: number, unit: MetricUnit): number {
  // + 0 turns -0 into 0.
  return Math.round(value * MM_PER[unit]) + 0;
}

/**
 * Formats a stored millimetre value in `unit`, e.g. 2700 → '2.7 m'. Rounds to
 * the nearest millimetre and drops trailing zeros. `suffix: false` leaves the
 * unit off, for an input box that shows the unit beside it.
 */
export function formatLength(
  mm: number,
  unit: MetricUnit,
  { suffix = true }: { suffix?: boolean } = {}
): string {
  const text = String(Number(fromMm(mm, unit).toFixed(DECIMALS[unit])) + 0);
  return suffix ? `${text} ${unit}` : text;
}

const LENGTH = /^([+-]?(?:\d+\.?\d*|\.\d+))\s*(mm|cm|m)?$/i;

/**
 * Parses typed input in mm, cm or m back to whole millimetres: '2.7m',
 * '270 cm' and '2700' (in `unit`) are all 2700. A bare number is read in
 * `unit`, the one the user is working in. Returns null for anything else,
 * so the caller can keep the old value.
 */
export function parseLength(text: string, unit: MetricUnit): number | null {
  const match = LENGTH.exec(text.trim());
  if (!match) return null;
  const typed = (match[2]?.toLowerCase() as MetricUnit | undefined) ?? unit;
  return toMm(Number(match[1]), typed);
}
