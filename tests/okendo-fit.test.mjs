/**
 * The centered-range -> small/true/large mapping is the highest-risk logic in
 * the Okendo integration: a wrong scale mislabels every review while looking
 * like working software. These lock the semantics down.
 *
 *   npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fitFromAttribute, mapOkendoReview, normaliseProductId } from "../src/data/reviews/okendo.ts";
import { OKENDO_MAPPING } from "../src/data/reviews/config.ts";

const sizing = (value) => ({
  title: "Sizing",
  type: "centered-range",
  minLabel: "Too Small",
  midLabel: "Just Right",
  maxLabel: "Too Big",
  value,
});

test("scale assumption is the documented default", () => {
  assert.deepEqual(OKENDO_MAPPING.fitScale, { min: 1, max: 5 });
});

test("minimum value means the garment ran small", () => {
  // minLabel is "Too Small", so the low end must map to "small", not "large".
  assert.equal(fitFromAttribute(sizing(1)), "small");
});

test("maximum value means the garment ran large", () => {
  assert.equal(fitFromAttribute(sizing(5)), "large");
});

test("midpoint means true to size", () => {
  assert.equal(fitFromAttribute(sizing(3)), "true");
});

test("one notch either side is a real signal", () => {
  assert.equal(fitFromAttribute(sizing(2)), "small");
  assert.equal(fitFromAttribute(sizing(4)), "large");
});

test("dead zone absorbs near-centre noise", () => {
  // offset 0.2 < deadZone 0.25 -> not reported as a sizing problem
  assert.equal(fitFromAttribute(sizing(3.4)), "true");
  assert.equal(fitFromAttribute(sizing(2.6)), "true");
});

test("missing or non-numeric attributes do not invent a verdict", () => {
  assert.equal(fitFromAttribute(undefined), "true");
  assert.equal(fitFromAttribute({ title: "Sizing", value: "Just Right" }), "true");
  assert.equal(fitFromAttribute({ title: "Sizing" }), "true");
});

test("maps a full Okendo review, matching the documented shape", () => {
  const raw = {
    reviewId: "rev_123",
    productId: "gid://shopify/Product/987654321",
    rating: 4,
    title: "Runs big",
    body: "Lovely fabric but I sized down.",
    dateCreated: "2026-07-02T10:00:00Z",
    isVerifiedBuyer: true,
    reviewer: { displayName: "Rae C." },
    attributesWithRating: [sizing(5)],
    attributes: [
      { title: "Height", value: "5'7\"-5'9\"" },
      { title: "Size purchased", value: "L" },
    ],
  };
  const r = mapOkendoReview(raw, 0);
  assert.equal(r.id, "rev_123");
  assert.equal(r.rating, 4);
  assert.equal(r.verified, true);
  assert.equal(r.author, "Rae C.");
  assert.equal(r.fitFeedback, "large");
  assert.equal(r.heightBand, "5'7\"-5'9\"");
  assert.equal(r.sizePurchased, "L");
});

test("absent fit fields are stated as unknown, never invented", () => {
  const r = mapOkendoReview({ reviewId: "x", rating: 5, body: "Good" }, 0);
  assert.equal(r.heightBand, "Not given");
  assert.equal(r.fitFeedback, "true");
});

test("ratings are clamped into 1..5", () => {
  assert.equal(mapOkendoReview({ rating: 9 }, 0).rating, 5);
  assert.equal(mapOkendoReview({ rating: 0 }, 0).rating, 1);
  assert.equal(mapOkendoReview({ rating: undefined }, 0).rating, 5);
});

test("product ids join on the numeric tail of a Shopify gid", () => {
  assert.equal(normaliseProductId("gid://shopify/Product/987654321"), "987654321");
  assert.equal(normaliseProductId("987654321"), "987654321");
  assert.equal(normaliseProductId(undefined), "");
});
