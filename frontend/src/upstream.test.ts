// Accurona: with the author's online services off, no add-on is advertised; one unlocked by a pack still shows.

import assert from "node:assert/strict";
import { test } from "node:test";
import { released } from "./features.ts";
import { setPacks } from "./packs.ts";
import { upstreamServices } from "./upstream.ts";

test("the author's online services ship switched off", () => {
  assert.equal(upstreamServices(), false);
});

test("without the shop, an add-on shows only once its pack is installed", () => {
  setPacks([]);
  assert.equal(released("auto_pro"), false);
  assert.equal(released("camera_cockpit"), false);
  assert.equal(released("diagnostics"), false);
  setPacks([{ id: "mastershort.pro_auto", name: "Pro: Auto Pro", items: [], features: ["auto_pro"] } as never]);
  assert.equal(released("auto_pro"), true);
  setPacks([]);
});
