/**
 * Image CDN URL building.
 *
 * Two of these are regression tests for bugs found by actually rendering the
 * component rather than trusting the types:
 *
 *   1. A local /sample/x.png was rewritten to https://cdn.shopify.com/sample/x.png,
 *      producing a URL that 404s.
 *   2. With a non-transformable source, the component still emitted a
 *      six-width srcset and <source type="image/avif"> for a single PNG —
 *      lying to the browser about both size and format.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildUrl, buildSrcset, canTransform, isRelative, isShopifyHosted,
  SRCSET_WIDTHS, FORMAT_PREFERENCE, mimeFor,
} from "../src/lib/images/provider.ts";

const shopify = { provider: "shopify", account: undefined };
const cloudinary = { provider: "cloudinary", account: "demo" };
const imgix = { provider: "imgix", account: "vestry" };

const SHOPIFY_SRC = "https://cdn.shopify.com/s/files/1/0000/product.jpg";
const LOCAL_SRC = "/sample/everyday-crew-chalk-front.png";

/* --- regression 1: never rewrite a source the CDN does not host --------- */

test("relative sources are recognised as relative", () => {
  assert.equal(isRelative(LOCAL_SRC), true);
  assert.equal(isRelative(SHOPIFY_SRC), false);
});

test("a local path is NOT rewritten onto the Shopify CDN", () => {
  const url = buildUrl(LOCAL_SRC, 640, "webp", shopify);
  assert.equal(url, LOCAL_SRC, "local images must pass through untouched");
  assert.ok(!url.includes("cdn.shopify.com"));
});

test("a foreign absolute URL is not rewritten onto the Shopify CDN", () => {
  const foreign = "https://images.example.com/a.jpg";
  assert.equal(buildUrl(foreign, 640, "webp", shopify), foreign);
});

test("a genuinely Shopify-hosted image IS transformed", () => {
  assert.equal(isShopifyHosted(SHOPIFY_SRC), true);
  const url = buildUrl(SHOPIFY_SRC, 640, "webp", shopify);
  assert.ok(url.includes("width=640"), url);
  assert.ok(url.includes("format=webp"), url);
});

test("jpg is the fallback and carries no format param", () => {
  const url = buildUrl(SHOPIFY_SRC, 900, "jpg", shopify);
  assert.ok(url.includes("width=900"));
  assert.ok(!url.includes("format="), url);
});

/* --- regression 2: do not advertise transforms we cannot perform -------- */

test("canTransform is false for sources the provider does not host", () => {
  assert.equal(canTransform(LOCAL_SRC, shopify), false);
  assert.equal(canTransform(LOCAL_SRC, cloudinary), false);
  assert.equal(canTransform(SHOPIFY_SRC, shopify), true);
});

test("canTransform is false when a provider account is missing", () => {
  assert.equal(canTransform(SHOPIFY_SRC, { provider: "cloudinary" }), false);
  assert.equal(canTransform(SHOPIFY_SRC, { provider: "imgix" }), false);
});

test("passthrough provider never claims it can transform", () => {
  assert.equal(canTransform(SHOPIFY_SRC, { provider: "passthrough" }), false);
});

/* --- srcset ------------------------------------------------------------- */

test("srcset never advertises a width above the intrinsic size", () => {
  const set = buildSrcset(SHOPIFY_SRC, "webp", 900, shopify);
  const widths = [...set.matchAll(/ (\d+)w/g)].map((m) => Number(m[1]));
  assert.ok(widths.length > 0);
  assert.ok(Math.max(...widths) <= 900, `upscaled: ${widths}`);
});

test("a very small source still yields one candidate", () => {
  const set = buildSrcset(SHOPIFY_SRC, "webp", 120, shopify);
  const widths = [...set.matchAll(/ (\d+)w/g)].map((m) => Number(m[1]));
  assert.deepEqual(widths, [120]);
});

test("srcset candidates are distinct URLs, not one URL repeated", () => {
  const set = buildSrcset(SHOPIFY_SRC, "webp", 2048, shopify);
  const urls = set.split(", ").map((c) => c.split(" ")[0]);
  assert.equal(new Set(urls).size, urls.length,
    "duplicate URLs with different width descriptors mislead the browser");
});

test("widths include a genuinely small candidate for mobile grids", () => {
  // A 3-across mobile grid asks for ~180px. Serving 1200px there is the most
  // common cause of a slow fashion collection page.
  assert.ok(SRCSET_WIDTHS[0] <= 320, `smallest is ${SRCSET_WIDTHS[0]}`);
});

/* --- formats ------------------------------------------------------------ */

test("modern formats are offered before jpg fallback", () => {
  assert.deepEqual([...FORMAT_PREFERENCE], ["avif", "webp"]);
});

test("mime types match the formats offered", () => {
  assert.equal(mimeFor("avif"), "image/avif");
  assert.equal(mimeFor("webp"), "image/webp");
  assert.equal(mimeFor("jpg"), "image/jpeg");
});

/* --- other providers ---------------------------------------------------- */

test("cloudinary encodes the source and requests the format explicitly", () => {
  const url = buildUrl(SHOPIFY_SRC, 640, "avif", cloudinary);
  assert.ok(url.startsWith("https://res.cloudinary.com/demo/image/fetch/"), url);
  assert.ok(url.includes("f_avif"), url);
  assert.ok(url.includes("w_640"), url);
});

test("imgix builds against the account subdomain", () => {
  const url = buildUrl(SHOPIFY_SRC, 480, "webp", imgix);
  assert.ok(url.startsWith("https://vestry.imgix.net/"), url);
  assert.ok(url.includes("w=480"), url);
  assert.ok(url.includes("fm=webp"), url);
});
