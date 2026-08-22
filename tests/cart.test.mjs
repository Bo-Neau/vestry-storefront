/**
 * Cart logic. Bugs here cost money directly, in both directions: a shopper
 * charged the wrong amount, or a shop that lets someone set their own price.
 *
 * The central property under test: a cookie is client-controlled, so it may
 * influence WHAT is in the cart and HOW MANY, but never WHAT IT COSTS.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseCartCookie, serialiseCartCookie, lineKey, parseLineKey,
} from "../src/lib/cart/cookie.ts";
import { buildLocalCart, addLine, setQuantity, removeLine } from "../src/lib/cart/local.ts";
import { validateAdd } from "../src/lib/cart/index.ts";
import { MAX_QUANTITY_PER_LINE } from "../src/lib/cart/types.ts";
import { PRODUCTS } from "../src/data/catalogue.ts";

const CREW = "everyday-crew";

/**
 * Resolved from the catalogue rather than hardcoded. Colourway ids are
 * derived from the product handle and colour name when the catalogue is
 * generated from CSV, so a literal id here would break every time the sheets
 * are re-imported — testing the fixture instead of the behaviour.
 */
const WHITE = PRODUCTS.find((p) => p.handle === CREW).colorways[0].id;

/* --- cookie parsing is hostile-input territory -------------------------- */

test("round-trips a valid cookie", () => {
  const lines = [{ handle: CREW, colorwayId: WHITE, size: "M", quantity: 2 }];
  assert.deepEqual(parseCartCookie(serialiseCartCookie(lines)), lines);
});

test("rejects a cookie without the version prefix", () => {
  assert.deepEqual(parseCartCookie("everyday-crew~tee1-white~M~1"), []);
});

test("drops malformed segments instead of throwing", () => {
  for (const bad of ["v1|garbage", "v1|a~b", "v1|~~~", "v1|" + "x".repeat(500)]) {
    assert.doesNotThrow(() => parseCartCookie(bad));
  }
  assert.deepEqual(parseCartCookie("v1|garbage"), []);
});

test("rejects sizes outside the known scale", () => {
  assert.deepEqual(parseCartCookie(`v1|${CREW}~${WHITE}~XXXL~1`), []);
});

test("rejects handles with unsafe characters", () => {
  assert.deepEqual(parseCartCookie(`v1|../../etc~${WHITE}~M~1`), []);
  assert.deepEqual(parseCartCookie(`v1|<script>~${WHITE}~M~1`), []);
});

test("caps an absurd quantity from a tampered cookie", () => {
  const parsed = parseCartCookie(`v1|${CREW}~${WHITE}~M~99999`);
  assert.equal(parsed[0].quantity, MAX_QUANTITY_PER_LINE);
});

test("rejects zero and negative quantities", () => {
  assert.deepEqual(parseCartCookie(`v1|${CREW}~${WHITE}~M~0`), []);
  assert.deepEqual(parseCartCookie(`v1|${CREW}~${WHITE}~M~-5`), []);
});

/* --- price is never taken from the client ------------------------------- */

test("price comes from the catalogue, not the cookie", () => {
  const cart = buildLocalCart(
    [{ handle: CREW, colorwayId: WHITE, size: "M", quantity: 2 }],
    PRODUCTS,
  );
  const product = PRODUCTS.find((p) => p.handle === CREW);
  assert.equal(cart.lines[0].unitPrice.amount, product.price.amount);
  assert.equal(cart.lines[0].linePrice.amount, product.price.amount * 2);
  assert.equal(cart.subtotal.amount, product.price.amount * 2);
});

test("a line for a product that no longer exists is dropped, with a warning", () => {
  const cart = buildLocalCart(
    [{ handle: "ghost-product", colorwayId: "x", size: "M", quantity: 1 }],
    PRODUCTS,
  );
  assert.equal(cart.lines.length, 0);
  assert.equal(cart.subtotal.amount, 0);
  assert.match(cart.warning ?? "", /no longer available/);
});

test("a line for a delisted colourway is dropped", () => {
  const cart = buildLocalCart(
    [{ handle: CREW, colorwayId: "no-such-colour", size: "M", quantity: 1 }],
    PRODUCTS,
  );
  assert.equal(cart.lines.length, 0);
});

test("carries live stock so the cart can flag over-ordering", () => {
  const cart = buildLocalCart(
    [{ handle: CREW, colorwayId: WHITE, size: "M", quantity: 5 }],
    PRODUCTS,
  );
  const product = PRODUCTS.find((p) => p.handle === CREW);
  const stock = product.colorways.find((c) => c.id === WHITE)
    .sizes.find((s) => s.size === "M").inventory;
  assert.equal(cart.lines[0].available, stock);
});

/* --- line mutation ------------------------------------------------------ */

test("adding the same variant increments rather than duplicating", () => {
  let lines = addLine([], { handle: CREW, colorwayId: WHITE, size: "M", quantity: 1 });
  lines = addLine(lines, { handle: CREW, colorwayId: WHITE, size: "M", quantity: 2 });
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 3);
});

test("a different size is a separate line", () => {
  let lines = addLine([], { handle: CREW, colorwayId: WHITE, size: "M", quantity: 1 });
  lines = addLine(lines, { handle: CREW, colorwayId: WHITE, size: "L", quantity: 1 });
  assert.equal(lines.length, 2);
});

test("incrementing cannot exceed the cap", () => {
  let lines = addLine([], { handle: CREW, colorwayId: WHITE, size: "M", quantity: 9 });
  lines = addLine(lines, { handle: CREW, colorwayId: WHITE, size: "M", quantity: 9 });
  assert.equal(lines[0].quantity, MAX_QUANTITY_PER_LINE);
});

test("setting quantity to zero removes the line", () => {
  const lines = addLine([], { handle: CREW, colorwayId: WHITE, size: "M", quantity: 2 });
  assert.equal(setQuantity(lines, lineKey(CREW, WHITE, "M"), 0).length, 0);
});

test("remove only affects the matching line", () => {
  let lines = addLine([], { handle: CREW, colorwayId: WHITE, size: "M", quantity: 1 });
  lines = addLine(lines, { handle: CREW, colorwayId: WHITE, size: "L", quantity: 1 });
  const after = removeLine(lines, lineKey(CREW, WHITE, "M"));
  assert.equal(after.length, 1);
  assert.equal(after[0].size, "L");
});

test("line keys round-trip", () => {
  const parsed = parseLineKey(lineKey(CREW, WHITE, "L"));
  assert.equal(parsed.handle, CREW);
  assert.equal(parsed.colorwayId, WHITE);
  assert.equal(parsed.size, "L");
});

/* --- server-side validation --------------------------------------------- */

test("rejects a sold-out variant even though the form disables it", () => {
  // Forms are client-side and can be replayed; state changes re-check.
  const boxy = PRODUCTS.find((p) => p.handle === "boxy-pocket-tee");
  const sand = boxy.colorways[0];
  const soldOut = sand.sizes.find((s) => s.inventory === 0);
  const result = validateAdd(PRODUCTS, {
    handle: boxy.handle, colorwayId: sand.id, size: soldOut.size, quantity: 1,
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /sold out/i);
});

test("accepts a variant that is genuinely in stock", () => {
  const crew = PRODUCTS.find((p) => p.handle === CREW);
  const white = crew.colorways.find((c) => c.id === WHITE);
  const inStock = white.sizes.find((s) => s.inventory > 0);
  assert.deepEqual(
    validateAdd(PRODUCTS, { handle: CREW, colorwayId: WHITE, size: inStock.size, quantity: 1 }),
    { ok: true },
  );
});

test("rejects unknown products and quantities out of range", () => {
  assert.equal(validateAdd(PRODUCTS, { handle: "nope", colorwayId: "x", size: "M", quantity: 1 }).ok, false);
  assert.equal(validateAdd(PRODUCTS, { handle: CREW, colorwayId: WHITE, size: "L", quantity: 0 }).ok, false);
  assert.equal(validateAdd(PRODUCTS, { handle: CREW, colorwayId: WHITE, size: "L", quantity: 999 }).ok, false);
});
