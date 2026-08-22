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

export default defineConfig({
  /**
   * Absolute base URL. Required for canonical tags, Open Graph URLs and the
   * sitemap — all of which must be absolute, not relative.
   *
   * On Vercel, VERCEL_PROJECT_PRODUCTION_URL is injected automatically, so
   * preview and production deploys get correct URLs without configuration.
   */
  site:
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://example.com"),

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
