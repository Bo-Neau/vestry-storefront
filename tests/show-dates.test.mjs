/* ---------------------------------------------------------------
   The one piece of copy on this site with an expiry date.

   A trade show runs for three days and the page invited people to
   the stand for three weeks after the hall closed. Nothing was
   broken — it rendered perfectly and said something untrue, which
   is the kind of fault no build step catches.
   --------------------------------------------------------------- */

import { test } from "node:test";
import assert from "node:assert/strict";
import { TEXWORLD, VISIT, showHasEnded } from "../src/data/site.ts";

const at = (iso) => new Date(iso);

test("the show is current right up to the end of its last day", () => {
  assert.equal(showHasEnded(at("2026-08-30T12:00:00+02:00")), false, "the day before");
  assert.equal(showHasEnded(at("2026-08-31T09:00:00+02:00")), false, "opening morning");
  assert.equal(showHasEnded(at("2026-09-02T18:00:00+02:00")), false, "closing evening");
});

test("and over once its last day is", () => {
  assert.equal(showHasEnded(at("2026-09-03T08:00:00+02:00")), true, "the next morning");
  assert.equal(showHasEnded(at("2026-09-28T00:00:00+02:00")), true, "three weeks later");
});

test("it is judged in Paris time, where the show is", () => {
  // 23:30 on the closing night in Paris is already the next day in Yangon.
  // The stand is still open; the copy must not have switched.
  assert.equal(showHasEnded(at("2026-09-02T23:30:00+02:00")), false);
  assert.equal(showHasEnded(at("2026-09-03T00:30:00+02:00")), true);
});

test("both versions of the copy exist and say different things", () => {
  for (const key of ["eyebrow", "heading", "body"]) {
    assert.ok(VISIT.upcoming[key]?.length, `upcoming.${key} must be set`);
    assert.ok(VISIT.past[key]?.length, `past.${key} must be set`);
    assert.notEqual(VISIT.past[key], VISIT.upcoming[key], `past.${key} must differ`);
  }
});

test("the past copy does not invite anyone anywhere", () => {
  /*
    The failure this guards against is a rewrite that quietly promises
    something nobody agreed to — an appointment, a showroom visit, a next
    edition. None of those has been confirmed by the client.
  */
  const text = `${VISIT.past.heading} ${VISIT.past.body}`.toLowerCase();
  for (const phrase of ["come see", "visit us", "book", "appointment", "next edition", "see you"]) {
    assert.ok(!text.includes(phrase), `past copy must not promise "${phrase}"`);
  }
});

test("the dates in the structured data are a real range", () => {
  assert.ok(at(TEXWORLD.start) < at(TEXWORLD.end), "start must precede end");
  assert.match(TEXWORLD.start, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(TEXWORLD.end, /^\d{4}-\d{2}-\d{2}$/);
});
