import type { APIRoute } from "astro";
import { loadProducts } from "../data/source.ts";
import { LOOKS } from "../data/looks.ts";

/**
 * Sitemap, generated from live data.
 *
 * Only canonical URLs: one entry per style, one per collection. No filtered
 * views and no colourway variants — those are combinatorially infinite and
 * canonicalised elsewhere, so listing them would invite exactly the crawl
 * waste the canonical tags exist to prevent.
 */
const COLLECTIONS = ["all", "outerwear", "tops", "skirts", "dresses"];

const escape = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://example.com")).origin;
  const { products } = await loadProducts();
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${base}/`, priority: "1.0", freq: "daily" },
    // No /cart. robots.txt disallows it and the page sends noindex, so
    // listing it here made three signals disagree about the same URL.
    ...COLLECTIONS.map((c) => ({
      loc: `${base}/collections/${c}`,
      priority: "0.8",
      freq: "daily",
    })),
    ...products.map((p) => ({
      loc: `${base}/products/${p.handle}`,
      priority: "0.9",
      freq: "weekly",
    })),
    // Look pages are real landing pages — styled outfits are how people
    // search for clothes ("what do I wear this with"), so they belong here.
    ...LOOKS.map((l) => ({
      loc: `${base}/looks/${l.handle}`,
      priority: "0.7",
      freq: "monthly",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escape(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
