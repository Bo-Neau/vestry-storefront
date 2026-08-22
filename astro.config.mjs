// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  /**
   * Absolute base URL. Required for canonical tags, Open Graph URLs and the
   * sitemap — all of which must be absolute, not relative.
   *
   * Override per environment with SITE_URL.
   */
  site: process.env.SITE_URL ?? "https://vestry.example",

  /**
   * On-demand rendering.
   *
   * A clothing storefront shows live stock — sizes sell out, and a
   * statically built page will happily advertise inventory that is gone.
   * Server rendering also lets filters live in the URL as plain query
   * params, so faceting needs no client JavaScript at all.
   */
  output: "server",
  adapter: node({ mode: "standalone" }),

  // No UI framework, no client runtime. Fashion sits at the worst Core Web
  // Vitals pass rate in retail; the cheapest way to win is to ship no JS.
  integrations: [],

  build: { inlineStylesheets: "auto" },
});
