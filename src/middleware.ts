import type { MiddlewareHandler } from "astro";

/**
 * Security headers.
 *
 * The storefront ships ZERO JavaScript, which allows a far stricter policy
 * than most sites can run: `script-src 'none'` means an injected <script> —
 * from a product description, a review, or a merchant field — simply cannot
 * execute. That turns most XSS from a breach into a rendering bug.
 *
 * Relax deliberately, not by reflex. Adding analytics or a chat widget means
 * loosening script-src, and that is exactly the decision worth making
 * consciously rather than discovering later.
 */

/**
 * Astro's dev server injects the Vite HMR client, which `script-src 'none'`
 * would block — breaking hot reload and making the policy look wrong locally.
 * Dev gets a relaxed script-src; production gets the strict one.
 *
 * The header is still SENT in dev so the rest of the policy is exercised
 * during development rather than first meeting reality on deploy.
 */
const DEV = import.meta.env.DEV;

const CSP = [
  "default-src 'self'",
  // No scripts anywhere in production. See note above before changing this.
  DEV ? "script-src 'self' 'unsafe-inline'" : "script-src 'none'",
  // Astro inlines component-scoped <style> blocks, so inline styles are
  // required. Style injection is a far lower risk than script injection.
  "style-src 'self' 'unsafe-inline'",
  // Product imagery may come from a CDN; data: covers inline SVG placeholders.
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // The storefront itself makes no client-side requests.
  // Dev also needs the HMR websocket.
  DEV ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
  "form-action 'self'",
  // Checkout is an outbound link to the commerce platform.
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Static assets are served by the adapter; headers still apply to all.
  const headers = response.headers;

  headers.set("Content-Security-Policy", CSP);
  // Stop browsers guessing a content type and executing something as script.
  headers.set("X-Content-Type-Options", "nosniff");
  // Clickjacking. Redundant with frame-ancestors, kept for older browsers.
  headers.set("X-Frame-Options", "DENY");
  // Do not leak full URLs (which carry cart and filter state) to other sites.
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Nothing here needs these capabilities.
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  // Only meaningful over HTTPS; harmless otherwise. Two years, no preload —
  // add preload deliberately once the domain is settled.
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");

  return response;
};
