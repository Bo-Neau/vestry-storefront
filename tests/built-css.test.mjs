/* ---------------------------------------------------------------
   Three invariants about the CSS that actually ships.

   All three exist because all three broke silently: the dev server
   serves unminified source, so each one worked perfectly while it was
   being built and did nothing at all once deployed. None of them
   throws, logs, or renders wrong — the motion simply stops happening.
   The only way to catch them is to read the built file.
   --------------------------------------------------------------- */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/* fileURLToPath, not `.pathname` — this project lives under a directory with
   a space in its name, and `.pathname` hands back the %20 still encoded. */
const DIST = fileURLToPath(new URL("../dist/_assets/", import.meta.url));

function stylesheets() {
  assert.ok(
    existsSync(DIST),
    `No build to inspect at ${DIST}. Run \`npm run build\` before \`npm test\`.`,
  );
  return readdirSync(DIST)
    .filter((f) => f.endsWith(".css"))
    .map((f) => ({ name: f, css: readFileSync(join(DIST, f), "utf8") }));
}

test("no scroll timeline is smuggled into the `animation` shorthand", () => {
  /*
    The minifier folds animation longhands back into the shorthand whenever
    `animation-name` sits in the same rule, and it writes the timeline in
    with them: `animation: linear both draw view()`. No browser accepts a
    timeline there — it was taken back out of the spec — so the whole
    declaration is invalid and dropped, and `animation-name` computes to
    `none`.

    The fix is to keep `animation-name` in a rule of its own, where there is
    nothing to fold it into. This test is what stops it drifting back.
  */
  const offenders = [];
  for (const { name, css } of stylesheets()) {
    for (const m of css.matchAll(/animation:[^;}]*/g)) {
      if (/\b(view|scroll)\(/.test(m[0])) offenders.push(`${name}: ${m[0]}`);
    }
  }
  assert.deepEqual(offenders, [], `animation shorthand carrying a timeline:\n${offenders.join("\n")}`);
});

test("nothing that clips a drifting layer is left as `overflow: hidden`", () => {
  /*
    `overflow: hidden` makes an element a scroll container, and a `view()`
    timeline binds to its subject's nearest ancestor scroll container. A
    frame that clips a parallax layer and uses `hidden` therefore binds that
    layer to itself — and it never scrolls, so the layer freezes at whatever
    progress it happened to resolve at.

    `clip` cuts the same overflow without creating a scroll container. Every
    clipping frame here must end up with it; `.sr-only` is the one place
    `hidden` is the point rather than a mistake.
  */
  const ALLOWED = new Set([".sr-only"]);
  const bad = [];
  for (const { name, css } of stylesheets()) {
    const hidden = new Set();
    const clipped = new Set();
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = m[1].split(",").map((s) => s.trim()).filter(Boolean);
      const body = m[2];
      const target = /overflow:\s*hidden/.test(body)
        ? hidden
        : /overflow:\s*clip/.test(body)
          ? clipped
          : null;
      if (!target) continue;
      // Astro appends a scope attribute; compare on the class name alone.
      for (const s of selectors) target.add(s.replace(/\[data-astro-cid-[^\]]*\]/g, "").trim());
    }
    for (const s of hidden) {
      if (ALLOWED.has(s) || clipped.has(s)) continue;
      bad.push(`${name}: ${s}`);
    }
  }
  assert.deepEqual(bad, [], `clipping frames still on overflow:hidden:\n${bad.join("\n")}`);
});

test("`:global()` never reaches a plain stylesheet", () => {
  /*
    `:global()` is an Astro construct for scoped component styles. In a
    plain .css file it is not valid CSS, and one invalid selector
    invalidates the entire comma-separated list it appears in — so it takes
    the working selectors down with it. That is how `object-fit: cover`
    stopped applying and left a band of empty ink under every framed
    photograph.
  */
  const dir = fileURLToPath(new URL("../src/styles/", import.meta.url));
  const offenders = readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    // Comments stripped first: the note warning against `:global()` names it.
    .filter((f) => readFileSync(join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").includes(":global("));
  assert.deepEqual(offenders, [], `:global() in a plain stylesheet: ${offenders.join(", ")}`);
});
