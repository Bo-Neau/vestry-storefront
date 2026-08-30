/* ---------------------------------------------------------------
   The site's public address, base path included.

   `Astro.site` is the ORIGIN and nothing else. astro.config strips
   any path off SITE_URL on purpose, because Astro's convention is
   that `site` carries the origin and `base` carries the subpath —
   so on a GitHub Pages project site `Astro.site.href` is
   `https://user.github.io/`, not `https://user.github.io/repo/`.

   Anything that publishes that as an ADDRESS — a sitemap entry, the
   `Sitemap:` line in robots.txt, a JSON-LD `url` — then points at a
   page that is not this site. Which is exactly what shipped: the
   sitemap told crawlers the site lived at the account root.

   The canonical tag never had the bug because it is built from
   `Astro.url.pathname`, which already includes the base. Everything
   else has to put it back, and that is what this does. `BASE_URL` is
   `/` when no base is set, so it is correct on a custom domain too.
   --------------------------------------------------------------- */

export const FALLBACK_SITE = "https://manussa.example";

/**
 * Join a base path onto an origin. Split out from `publicRoot` so it can be
 * tested against a base without a build — the bug is invisible unless a base
 * is actually set, which is the reason it survived to production.
 */
export function joinBase(site: URL | undefined, base: string): URL {
  const path = base || "/";
  return new URL(path.endsWith("/") ? path : `${path}/`, site ?? new URL(FALLBACK_SITE));
}

/** Where this site's home page lives, as an absolute URL ending in a slash. */
export const publicRoot = (site: URL | undefined): URL =>
  joinBase(site, import.meta.env?.BASE_URL ?? "/");

/** An absolute URL for a path within the site, base included. */
export const publicUrl = (path: string, site: URL | undefined): URL =>
  new URL(path.replace(/^\//, ""), publicRoot(site));
