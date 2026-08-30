// @ts-check
import { defineConfig } from "astro/config";

/**
 * Static output.
 *
 * The site is one page of fixed content with anchor navigation — nothing is
 * personalised, nothing is fetched at request time. Building it to plain files
 * means it can be served by GitHub Pages, Netlify, Vercel, or an S3 bucket
 * without an adapter, and every photograph is resized once at build rather
 * than on demand.
 *
 * The trade is that middleware no longer runs, so the security headers this
 * project used to set per-response are gone. GitHub Pages cannot set headers
 * at all; the layout therefore carries the policy it can express as a meta
 * tag, and docs/deploy.md records what a header-capable host should add.
 */

/**
 * Trimmed value, or undefined when unset or blank.
 *
 * A blank env var is the failure this guards: `process.env.X ?? fallback`
 * happily returns "" and hands an empty string to `new URL()`, which throws
 * during the build with no indication of which variable caused it.
 * @param {string} key
 * @returns {string | undefined}
 */
function envValue(key) {
  const raw = process.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Absolute origin, or undefined if the candidate is unusable.
 * @param {string | undefined} candidate
 * @returns {string | undefined}
 */
function toUrl(candidate) {
  if (!candidate) return undefined;
  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return undefined;
  }
}

/*
  Canonical URLs are absolute and baked in at build time, so the deployed host
  has to be known when the build runs. SITE_URL wins; Vercel's own variables
  are read as a fallback so a preview deploy still self-references correctly.
*/
const site =
  toUrl(envValue("SITE_URL"))
  ?? toUrl(envValue("VERCEL_PROJECT_PRODUCTION_URL"))
  ?? toUrl(envValue("VERCEL_URL"))
  ?? "https://manussa.example";

/*
  GitHub Pages serves a project site from /<repo>/ rather than the domain
  root, which breaks every absolute path on the page. Set BASE_PATH to the
  repo name for that case and leave it unset for a custom domain or any
  other host.
*/
const base = envValue("BASE_PATH");

export default defineConfig({
  site,
  ...(base ? { base } : {}),
  output: "static",
  trailingSlash: "ignore",
  build: {
    // One stylesheet rather than a file per component. The page is a single
    // document, so splitting the CSS only adds requests.
    inlineStylesheets: "auto",
    assets: "_assets",
  },
  image: {
    // Resize at build time with sharp. No image service, no runtime
    // transforms, nothing to configure on the host.
    service: { entrypoint: "astro/assets/services/sharp" },
  },
  devToolbar: { enabled: false },

  /*
    Emit the script as a file rather than inlining it.

    Astro inlines small hoisted scripts by default. That is usually a win —
    one fewer request — but this site's policy is `script-src 'self'` with no
    'unsafe-inline', so an inlined module is blocked by the very policy meant
    to protect it, and the eased scrolling silently does not run. A file is
    also cacheable across visits, which the inline version never is.
  */
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
