import type { APIRoute } from "astro";
import { deployEnv, isIndexable } from "../config/env.ts";

/**
 * robots.txt, generated so the sitemap URL always matches the deployed host.
 *
 * The Disallow rules matter more than the Allow ones. Faceted URLs are
 * combinatorially infinite — every size x fit x colour x gender combination is
 * a distinct URL serving near-identical content. Left open, a crawler spends
 * its budget on those instead of on product pages, and ranking signals split
 * across thousands of near-duplicates.
 *
 * Belt and braces: facet links also carry rel="nofollow", and filtered views
 * emit noindex.
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://example.com")).origin;

  // Preview and development deployments are closed to crawlers entirely.
  if (!isIndexable()) {
    return new Response(
      `# ${deployEnv()} deployment — not for indexing\nUser-agent: *\nDisallow: /\n`,
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const body = `# ${base}
User-agent: *
Allow: /

# Nothing is disallowed. The cart, the checkout endpoints and the faceted
# filter URLs that needed blocking all went with the shop, and the journal has
# no query parameters at all — every page is a distinct, canonical URL. A
# Disallow rule for a path that no longer exists is just a stale instruction
# a crawler has to read.

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
