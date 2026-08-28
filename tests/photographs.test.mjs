/**
 * Every photograph referenced by the data must exist as a real file.
 *
 * The image pipeline resolves a stored path against the files Vite finds under
 * src/assets. A typo there produces a broken picture on one page rather than a
 * loud failure, so the guard belongs in a test: if a filename in the data has
 * no file behind it, this fails before anyone deploys it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { DESIGNS } from "../src/data/designs.ts";

const FILES = new Set(
  readdirSync(new URL("../src/assets/photography", import.meta.url))
    .filter((f) => /\.(jpe?g|png)$/i.test(f)),
);

const basename = (p) => p.split("/").pop();

test("every photograph in the data exists on disk", () => {
  const missing = [];
  for (const design of DESIGNS) {
    for (const image of design.images) {
      if (!FILES.has(basename(image.src))) {
        missing.push(`${design.handle}: ${image.src}`);
      }
    }
  }
  assert.deepEqual(missing, [], missing.join("\n"));
});

test("every design has at least one photograph", () => {
  const bare = DESIGNS.filter((d) => d.images.length === 0).map((d) => d.handle);
  assert.deepEqual(bare, [], `these have no photography: ${bare.join(", ")}`);
});

test("every photograph declares intrinsic dimensions", () => {
  const bad = [];
  for (const design of DESIGNS) {
    for (const image of design.images) {
      if (!Number.isInteger(image.width) || image.width <= 0
        || !Number.isInteger(image.height) || image.height <= 0) {
        bad.push(`${design.handle}: ${image.src} (${image.width}x${image.height})`);
      }
    }
  }
  // Without these the browser cannot reserve space and the page reflows as
  // each photograph arrives — on a page that is mostly pictures, that is the
  // difference between a publication and a slideshow that jumps.
  assert.deepEqual(bad, [], bad.join("\n"));
});

test("every photograph has descriptive alt text", () => {
  const bad = [];
  for (const design of DESIGNS) {
    for (const image of design.images) {
      if (!image.alt || image.alt.trim().length < 8) {
        bad.push(`${design.handle}: ${image.src} alt="${image.alt}"`);
      }
    }
  }
  assert.deepEqual(bad, [], bad.join("\n"));
});

test("no photograph is used as the lead for more than two pieces", () => {
  // Double duty is a known gap in the shoot rather than a bug, but it should
  // not silently get worse: the same frame standing in for three pieces reads
  // as a placeholder to anyone browsing the collection.
  const counts = new Map();
  for (const design of DESIGNS) {
    const lead = design.images.find((i) => i.view === "front") ?? design.images[0];
    if (!lead) continue;
    const key = basename(lead.src);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const overused = [...counts.entries()].filter(([, n]) => n > 2);
  assert.deepEqual(overused, [], `reused too often: ${JSON.stringify(overused)}`);
});
