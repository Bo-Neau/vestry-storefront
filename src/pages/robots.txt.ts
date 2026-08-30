import type { APIRoute } from "astro";
import { publicRoot, publicUrl } from "../lib/site-url.ts";

/**
 * robots.txt.
 *
 * Nothing to disallow: the site is one public page with no query parameters,
 * no cart and no filtered views. A Disallow rule for a path that does not
 * exist is just a stale instruction a crawler has to read.
 *
 * Worth knowing where this currently lands: crawlers read robots.txt only
 * from a domain ROOT, and a GitHub Pages project site serves this one at
 * /<repo>/robots.txt. So on the github.io address it is written correctly and
 * read by nobody. It starts working the moment a custom domain is set, which
 * is a better reason to set one than most.
 */
export const GET: APIRoute = ({ site }) => {
  const home = publicRoot(site).href;
  return new Response(
    `# ${home}\nUser-agent: *\nAllow: /\n\nSitemap: ${publicUrl("sitemap.xml", site).href}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
