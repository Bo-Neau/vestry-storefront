/**
 * The eased scrolling curve.
 *
 * This is the site's only JavaScript, and its behaviour is a curve over time
 * — exactly the kind of thing that cannot be checked by looking at it once.
 * These assert the properties that make it feel right, and the ones that
 * would make it feel broken if they ever stopped holding.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { EASE, MIN_STEP, FRAME_MS, step, stepToward, arrived, clampTo, trajectory,
         framesToCover, easeForFrame, wheelPixels } from "../src/scripts/ease.ts";

test("approach is monotonic — it never overshoots or reverses", () => {
  const path = trajectory(0, 1000);
  for (let i = 1; i < path.length; i++) {
    assert.ok(path[i] >= path[i - 1], `reversed at frame ${i}: ${path[i - 1]} -> ${path[i]}`);
    assert.ok(path[i] <= 1000, `overshot at frame ${i}: ${path[i]}`);
  }
  assert.equal(path.at(-1), 1000, "must land exactly on the target");
});

test("it behaves the same scrolling back up", () => {
  const path = trajectory(1000, 0);
  for (let i = 1; i < path.length; i++) {
    assert.ok(path[i] <= path[i - 1], `reversed at frame ${i}`);
    assert.ok(path[i] >= 0, `undershot at frame ${i}`);
  }
  assert.equal(path.at(-1), 0);
});

test("a flick covers most of its distance in about a third of a second", () => {
  /*
    The perceived length of the gesture is how long it takes to get MOST of
    the way there, not the frame at which motion formally stops. Exponential
    approach has a tail that runs on for another half second moving less than
    a pixel a frame — invisible, and the reason the first version of this
    test asserted the wrong thing and failed.

    Around 350ms to 90% is weighted but obedient. Past about 600ms it stops
    reading as weight and starts reading as lag — which is what the first
    version of this shipped at, and it is what "not smooth at all" felt like.
  */
  const frames = framesToCover(0.9);
  const ms = Math.round(frames * FRAME_MS);
  assert.ok(ms >= 220, `too abrupt to read as eased: ${ms}ms to 90%`);
  assert.ok(ms <= 600, `too slow to feel responsive: ${ms}ms to 90%`);
});

test("the settle never ends with a jump", () => {
  /*
    This is the defect the walk-in exists for. An exponential approach has to
    be cut off somewhere, and cutting off means covering the remainder in one
    frame. Stopping when the next step fell under half a pixel meant a
    remainder of MIN_STEP/EASE — about ten pixels — arriving all at once, so
    every scroll on the site finished with a visible hitch. Measured through
    Chrome's input pipeline it was a 5px jump after a run of 1px steps.
  */
  for (const distance of [80, 400, 1200, 6000]) {
    const path = trajectory(0, distance);
    const last = path.at(-1) - path.at(-2);
    assert.ok(last <= MIN_STEP + 1e-9,
      `settle at ${distance}px ends with a ${last.toFixed(2)}px jump`);
  }
});

test("no frame in the tail moves nothing", () => {
  /*
    The other half of the same defect. An eased step of 0.4px cannot move an
    integer scroll offset, so that frame draws the page exactly where it
    already was — which reads as a dropped frame rather than as slowness. The
    floor guarantees every frame moves at least one pixel until it lands.
  */
  const path = trajectory(0, 1200);
  let previous = 0;
  for (const [i, position] of path.entries()) {
    const moved = position - previous;
    assert.ok(moved > 0, `frame ${i} of the settle moved nothing`);
    previous = position;
  }
});

test("the tail is short enough not to feel like lag", () => {
  // The walk-in trades a jump for a few extra frames. It must stay a few.
  const frames = trajectory(0, 1200).length;
  assert.ok(frames <= 90, `still animating a tail nobody can see: ${frames} frames`);
  assert.ok(frames >= 20, `stopping before the motion is actually finished: ${frames}`);
});

test("the curve is the same on a 60Hz and a 120Hz display", () => {
  /*
    A fixed per-frame ease runs at whatever rate the display does, so the
    same flick settled twice as fast on a ProMotion laptop as on an external
    monitor. Compounding by elapsed time makes it a function of seconds.

    Simulate both refresh rates over the same 300ms and compare where they
    got to.
  */
  const distance = 1000;
  const run = (frameMs) => {
    let current = 0;
    for (let t = 0; t < 300; t += frameMs) {
      current = step(current, distance, easeForFrame(frameMs));
    }
    return current;
  };
  const at60 = run(1000 / 60);
  const at120 = run(1000 / 120);
  const drift = Math.abs(at60 - at120) / distance;
  assert.ok(drift < 0.02,
    `refresh rate changes the curve by ${(drift * 100).toFixed(1)}% — ` +
    `60Hz reached ${Math.round(at60)}, 120Hz reached ${Math.round(at120)}`);
});

test("a stalled frame cannot resolve as an instant jump", () => {
  // A backgrounded tab can hand back a delta of seconds. Uncapped, that
  // compounds to ~1 and the page teleports the moment you return to it.
  const huge = easeForFrame(5000);
  assert.ok(huge < 0.6, `a 5s frame gap collapses the easing: factor ${huge.toFixed(3)}`);
});

test("wheel deltas are converted to pixels whatever the device reports", () => {
  // deltaY is only pixels when deltaMode is 0. Firefox reports lines, and
  // taking the raw number moved the page three pixels instead of a hundred.
  assert.equal(wheelPixels(100, 0), 100, "pixel mode passes through");
  assert.ok(wheelPixels(3, 1) > 90, `line mode under-scrolls: ${wheelPixels(3, 1)}`);
  assert.equal(wheelPixels(1, 2, 900), 900, "page mode is a viewport");
  // Direction must survive the conversion.
  assert.ok(wheelPixels(-3, 1) < 0, "scrolling up must stay negative");
});

test("the first frame moves a visible but small part of the way", () => {
  // Cover most of the distance and there is no easing to see; cover almost
  // none and the page feels unresponsive to the gesture.
  const first = step(0, 1000);
  assert.ok(first > 20, `first frame barely moves: ${first}`);
  assert.ok(first < 200, `first frame jumps most of the way: ${first}`);
});

test("arrival is exact, so it cannot creep or stall short", () => {
  assert.equal(stepToward(999.4, 1000), 1000, "the last pixel lands on the target");
  assert.ok(arrived(1000, 1000), "landing on the target is arrival");
  assert.ok(!arrived(999, 1000), "a pixel short is not arrival");
  assert.equal(trajectory(0, 1000).at(-1), 1000, "the walk-in lands exactly");
  assert.equal(trajectory(1000, 0).at(-1), 0, "and lands exactly going up too");
  assert.ok(MIN_STEP <= 1, "a floor above one pixel would be a visible step");
  assert.ok(EASE > 0 && EASE < 1, "ease must be a fraction");
});

test("targets stay inside the document", () => {
  assert.equal(clampTo(-500, 4000), 0, "cannot scroll above the top");
  assert.equal(clampTo(9999, 4000), 4000, "cannot scroll past the bottom");
  assert.equal(clampTo(1200, 4000), 1200, "leaves valid targets alone");
  assert.equal(clampTo(300, -50), 0, "a page shorter than the viewport has nowhere to go");
});

test("a burst of wheel events accumulates rather than restarting", () => {
  // Three quick flicks should travel three flicks' worth. If each one reset
  // the target, fast scrolling would stall.
  let target = 0;
  for (let i = 0; i < 3; i++) target = clampTo(target + 400, 10000);
  assert.equal(target, 1200);
});

test("a slower ease takes longer but still lands exactly", () => {
  const slow = trajectory(0, 1000, 0.04);
  const fast = trajectory(0, 1000, 0.15);
  assert.ok(slow.length > fast.length, "lower ease must take more frames");
  assert.equal(slow.at(-1), 1000);
  assert.equal(fast.at(-1), 1000);
});

test("a long flick and a short one feel the same length", () => {
  // Exponential approach is scale-free: the time to cover 90% does not
  // depend on the distance. A nudge and a full-page throw should have the
  // same character, which is what stops the page feeling inconsistent.
  const short = trajectory(0, 120).length;
  const long = trajectory(0, 6000).length;
  assert.ok(Math.abs(short - long) <= 60,
    `gesture length varies too much with distance: ${short} vs ${long} frames`);
});
