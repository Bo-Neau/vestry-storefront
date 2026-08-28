/**
 * robots.txt and sitemap.xml must agree.
 *
 * Regression test for a real contradiction found on the deployed site: the
 * sitemap advertised /cart while robots.txt disallowed it and the page itself
 * sent noindex. Three signals, three different answers about one URL. Search
 * engines resolve that by ignoring whichever one they trust least, which is
 * not a decision worth leaving to them.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GET as robotsGET } from "../src/pages/robots.txt.ts";
import { GET as sitemapGET } from "../src/pages/sitemap.xml.ts";

const site = new URL("https://example.test");
const ctx = { site };

// robots.txt closes preview and development deployments entirely, so the
// interesting comparison — does the sitemap advertise anything robots blocks —
// only exists on a production deployment. Pin the env for these tests.
process.env.VERCEL_ENV = "production";

const text = async (route) => await (await route(ctx)).text();

/** Turns a robots Disallow pattern into a matcher for a path. */
const matches = (pattern, path) => {
  // robots.txt wildcards: * matches any run of characters.
  const re = new RegExp(
    "^" + pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*"),
  );
  return re.test(path);
};

test("no sitemap URL is disallowed by robots.txt", async () => {
  const robots = await text(robotsGET);
  const sitemap = await text(sitemapGET);

  const disallowed = robots
    .split("\n")
    .filter((l) => l.trim().startsWith("Disallow:"))
    .map((l) => l.split(":").slice(1).join(":").trim())
    .filter(Boolean);

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    new URL(m[1]).pathname + new URL(m[1]).search,
  );

  assert.ok(locs.length > 5, "sitemap should not be empty");
  // No assertion that Disallow rules exist. The journal has none to make —
  // the cart and the faceted filter URLs that needed blocking went with the
  // shop. What matters is that nothing listed is also blocked, which holds
  // vacuously at zero rules and stops holding the moment one is added.
  assert.match(robots, /^User-agent: \*$/m, "robots must address crawlers");

  const conflicts = [];
  for (const loc of locs) {
    for (const rule of disallowed) {
      if (matches(rule, loc)) conflicts.push(`${loc} is listed but "Disallow: ${rule}" blocks it`);
    }
  }
  assert.deepEqual(conflicts, [], conflicts.join("\n"));
});

test("sitemap advertises the same host it is served from", async () => {
  const sitemap = await text(sitemapGET);
  const robots = await text(robotsGET);

  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    assert.equal(new URL(m[1]).origin, site.origin);
  }
  assert.ok(
    robots.includes(`Sitemap: ${site.origin}/sitemap.xml`),
    "robots must point at the sitemap on the deployed host",
  );
});

test("sitemap carries no facet or post-action URLs", async () => {
  const sitemap = await text(sitemapGET);
  for (const bad of ["?size=", "?fit=", "?color=", "added=", "error=", "removed="]) {
    assert.ok(!sitemap.includes(bad), `sitemap must not contain ${bad}`);
  }
});

test("preview and development deployments are closed to crawlers", async () => {
  const previous = process.env.VERCEL_ENV;
  try {
    for (const env of ["preview", "development"]) {
      process.env.VERCEL_ENV = env;
      const robots = await text(robotsGET);
      assert.match(robots, /Disallow: \/\s*$/m, `${env} must disallow everything`);
      assert.ok(!robots.includes("Allow: /"), `${env} must not allow crawling`);
    }
  } finally {
    process.env.VERCEL_ENV = previous;
  }
});
