// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

/**
 * Vercel sets VERCEL=1 in its build environment, so the right adapter is
 * chosen automatically: serverless on Vercel, a standalone Node server
 * everywhere else (local `npm run build`, Docker, Railway, Render, Fly).
 *
 * Keeping both means the project is not locked to one host — swapping is a
 * one-line change, not a migration.
 */
const onVercel = Boolean(process.env.VERCEL);

/** Trimmed value, or undefined when unset/blank. */
function envValue(key) {
  const raw = process.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Parses a candidate into an absolute origin, or undefined if unusable. */
function toUrl(candidate, source) {
  if (!candidate) return undefined;
  // Host-only values (Vercel supplies these without a scheme) get https.
  const withScheme = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;
  try {
    return new URL(withScheme).href.replace(/\/$/, "");
  } catch {
    console.warn(
      `[config] ${source} is not a usable URL: ${JSON.stringify(candidate)} — ignoring it.`,
    );
    return undefined;
  }
}

function resolveSite() {
  const resolved =
    toUrl(envValue("SITE_URL"), "SITE_URL") ??
    toUrl(envValue("VERCEL_PROJECT_PRODUCTION_URL"), "VERCEL_PROJECT_PRODUCTION_URL") ??
    toUrl(envValue("VERCEL_URL"), "VERCEL_URL");

  if (!resolved) {
    // Placeholder. Canonical tags and the sitemap will point at it, so set
    // SITE_URL before a real launch — but the build succeeds either way.
    return "https://example.com";
  }
  return resolved;
}

export default defineConfig({
  /**
   * Absolute base URL, used for canonical tags, Open Graph and the sitemap.
   *
   * Resolved defensively on purpose. A blank or malformed value here fails the
   * BUILD with "Invalid URL" and no indication of which variable is at fault —
   * which is exactly what happened when an empty SITE_URL was added in the
   * host dashboard. `??` does not catch an empty string, so `site: ""` reached
   * Astro and the deploy died.
   *
   * Now: empty and whitespace values are ignored, a missing protocol is added,
   * anything unparseable is discarded with a warning, and there is always a
   * valid fallback. A misconfigured variable degrades to wrong-but-working
   * URLs rather than a failed deploy.
   */
  site: resolveSite(),

  /**
   * On-demand rendering.
   *
   * A clothing storefront shows live stock — sizes sell out, and a statically
   * built page will happily advertise inventory that is gone. Server rendering
   * also lets filters live in the URL as plain query params, so faceting needs
   * no client JavaScript.
   *
   * This is also why GitHub Pages cannot host this project: Pages serves
   * static files only, and cart, filters and stock would all break.
   */
  output: "server",
  adapter: onVercel ? vercel() : node({ mode: "standalone" }),

  // No UI framework, no client runtime. Fashion sits at the worst Core Web
  // Vitals pass rate in retail; the cheapest way to win is to ship no JS.
  integrations: [],

  build: { inlineStylesheets: "auto" },
});
