/* ---------------------------------------------------------------
   The absolute URLs the site publishes about itself.

   These are the ones nobody looks at: a sitemap entry, the Sitemap:
   line in robots.txt, a JSON-LD `url`. They render fine, they are
   valid, and they can point at a completely different website
   without a single thing on the page looking wrong.

   Which is what happened. `Astro.site` is the ORIGIN — the config
   strips the path off SITE_URL deliberately, because `base` carries
   it instead — so on a GitHub Pages project site every one of these
   said `https://user.github.io/` while the site lived at
   `https://user.github.io/repo/`. The canonical tag was right the
   whole time, because it is built from a pathname rather than from
   `site`, which is what made the disagreement possible at all.
   --------------------------------------------------------------- */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { joinBase } from "../src/lib/site-url.ts";

const dist = (f) => fileURLToPath(new URL(`../dist/${f}`, import.meta.url));
const read = (f) => {
  const path = dist(f);
  assert.ok(existsSync(path), `No build to inspect. Run \`npm run build\` before \`npm test\`.`);
  return readFileSync(path, "utf8");
};

test("a base path is carried into the published address", () => {
  const origin = new URL("https://bo-neau.github.io");
  assert.equal(joinBase(origin, "/vestry-storefront").href,
    "https://bo-neau.github.io/vestry-storefront/", "a base without a trailing slash");
  assert.equal(joinBase(origin, "/vestry-storefront/").href,
    "https://bo-neau.github.io/vestry-storefront/", "and with one");
  assert.equal(joinBase(new URL("https://manussa.com"), "/").href,
    "https://manussa.com/", "no base, custom domain");
  assert.equal(joinBase(new URL("https://manussa.com"), "").href,
    "https://manussa.com/", "an empty base is the root");
});

test("the canonical, the sitemap and robots.txt agree on where the site is", () => {
  /*
    Any one of these can be wrong on its own without anything looking broken.
    Comparing them to each other is what catches it — they are three
    independent statements of the same fact and they are worthless if they
    disagree.
  */
  const html = read("index.html");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical, "the page must declare a canonical URL");

  const loc = read("sitemap.xml").match(/<loc>([^<]+)<\/loc>/)?.[1];
  assert.equal(loc, canonical, "the sitemap must list the canonical URL, not some other one");

  const sitemapLine = read("robots.txt").match(/Sitemap:\s*(\S+)/)?.[1];
  assert.equal(sitemapLine, new URL("sitemap.xml", canonical).href,
    "robots.txt must point at the sitemap this build actually wrote");

  const jsonLd = [...html.matchAll(/"url":"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(jsonLd.length > 0, "the page must carry structured data with a url");
  for (const url of jsonLd) {
    assert.equal(url, canonical, "every JSON-LD url must be the canonical one");
  }
});

test("the sitemap lists nothing robots.txt disallows", () => {
  // Three signals that can contradict each other. A URL that is listed for
  // crawling and blocked from crawling is a straight instruction to ignore.
  const robots = read("robots.txt");
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);
  const locs = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  for (const rule of disallowed) {
    for (const path of locs) {
      assert.ok(!path.startsWith(rule), `sitemap lists ${path}, robots.txt disallows ${rule}`);
    }
  }
});
