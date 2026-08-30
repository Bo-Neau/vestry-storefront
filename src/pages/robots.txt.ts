import type { APIRoute } from "astro";

/**
 * robots.txt.
 *
 * Nothing to disallow: the site is one public page with no query parameters,
 * no cart and no filtered views. A Disallow rule for a path that does not
 * exist is just a stale instruction a crawler has to read.
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://manussa.example")).origin;
  return new Response(
    `# ${base}\nUser-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
