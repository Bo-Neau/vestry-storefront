import type { APIRoute } from "astro";
import { DESIGNS } from "../data/designs.ts";
import { COLLECTIONS } from "../data/collections.ts";
import { CREDITED } from "../data/people.ts";

/**
 * Sitemap, generated from the journal's own data.
 *
 * Only canonical URLs. Nothing here is disallowed in robots.txt — the two
 * files are cross-checked by a test, after the deployed sitemap was once
 * caught advertising a path robots blocked.
 *
 * No `lastmod`. The journal deliberately carries no dates, and a lastmod
 * stamped with today's build date on content that has not changed is a lie
 * told to a crawler every time the site deploys.
 */
const escape = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://example.com")).origin;

  const urls = [
    { loc: `${base}/`, priority: "1.0", freq: "monthly" },
    { loc: `${base}/collections`, priority: "0.9", freq: "monthly" },
    { loc: `${base}/designers`, priority: "0.8", freq: "monthly" },
    { loc: `${base}/atelier`, priority: "0.7", freq: "yearly" },
    ...COLLECTIONS.map((c) => ({
      loc: `${base}/collections/${c.handle}`,
      priority: "0.9",
      freq: "monthly",
    })),
    // The pieces are the substance of the site, so they rank alongside the
    // collections rather than below them.
    ...DESIGNS.map((d) => ({
      loc: `${base}/pieces/${d.handle}`,
      priority: "0.9",
      freq: "yearly",
    })),
    ...CREDITED.map((p) => ({
      loc: `${base}/designers/${p.slug}`,
      priority: "0.7",
      freq: "yearly",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escape(u.loc)}</loc>
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
