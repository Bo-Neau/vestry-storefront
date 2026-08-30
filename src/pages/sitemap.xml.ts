import type { APIRoute } from "astro";
import { publicRoot } from "../lib/site-url.ts";

/**
 * Sitemap.
 *
 * One page, so one entry. The section anchors are not listed — a fragment is
 * not a separate URL, and listing them would ask a crawler to index the same
 * document five times.
 *
 * No lastmod: it would be stamped with the build date on every deploy whether
 * the content changed or not, which is a claim made to a crawler that happens
 * to be false most of the time.
 */
export const GET: APIRoute = ({ site }) => {
  // publicRoot, not site.origin. On a project site the origin is the account
  // root, and this told crawlers the site lived there.
  const home = publicRoot(site).href;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${home}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
