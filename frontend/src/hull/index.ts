// The hull: one interface (sections at stations) for every hull source, and what is worked out from it.

export type { Hull, HullBody, Section, SectionPoint } from "./types.ts";
export { bodyOutlineAt, bodyRange, bottomAt, halfAt, outlineAt, sampleXs, sectionAt, sheerAt } from "./sections.ts";
export { hydrostatics, SEA_WATER, type Hydrostatics } from "./hydrostatics.ts";
export { parametricHull, type ParametricHullSpec } from "./parametric.ts";
export { ShipD, shipdBody, shipdConstraints, shipdFeasible, SHIPD_PARAMETERS, type ShipDBodyOptions } from "./shipd.ts";
