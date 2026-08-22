import type { APIRoute } from "astro";

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

  const body = `# ${base}
User-agent: *
Allow: /

# Cart and its mutation endpoints — nothing to index, and crawling them
# would have a bot adding items to carts.
Disallow: /cart
Disallow: /cart/

# Faceted filter combinations. Infinite, near-duplicate, and a crawl trap.
Disallow: /*?*size=
Disallow: /*?*fit=
Disallow: /*?*color=
Disallow: /*?*neckline=
Disallow: /*?*sleeve=
Disallow: /*?*gender=
Disallow: /*?*category=

# Post-action states. Real pages, but not canonical entry points.
Disallow: /*?*added=
Disallow: /*?*error=
Disallow: /*?*removed=

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
