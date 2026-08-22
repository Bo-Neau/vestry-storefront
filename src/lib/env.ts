/**
 * Shopify configuration, read from the environment at runtime.
 *
 * Returns null when unconfigured rather than throwing, so the storefront
 * falls back to the local sample catalogue and stays runnable before any
 * Shopify account exists.
 */
export interface ShopifyConfig {
  readonly domain: string;
  readonly token: string;
  readonly apiVersion: string;
}

/** Latest stable at time of writing. Bump deliberately. */
const DEFAULT_API_VERSION = "2026-07";

function read(key: string): string | undefined {
  // process.env at runtime (node adapter); import.meta.env covers dev.
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)?.[key];
  const value = (fromProcess ?? fromMeta ?? "").trim();
  return value.length > 0 ? value : undefined;
}

export function shopifyConfig(): ShopifyConfig | null {
  const domain = read("SHOPIFY_STORE_DOMAIN");
  const token = read("SHOPIFY_STOREFRONT_TOKEN");
  if (!domain || !token) return null;

  /**
   * Refuse an Admin token here. Storefront tokens are designed to be public
   * and often end up in client bundles; an Admin token in the same position
   * would expose read/write access to the whole store. Failing loudly on a
   * copy-paste mistake is much cheaper than shipping it.
   */
  if (token.startsWith("shpat_")) {
    throw new Error(
      "SHOPIFY_STOREFRONT_TOKEN looks like an Admin API token (shpat_...). " +
      "Admin tokens must never be used for storefront requests — they grant " +
      "read/write access to the whole store. Put the Admin token in " +
      "SHOPIFY_ADMIN_TOKEN (used only by scripts/) and use the public " +
      "Storefront API token here.",
    );
  }

  const normalisedDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  return {
    domain: normalisedDomain,
    token,
    apiVersion: read("SHOPIFY_API_VERSION") ?? DEFAULT_API_VERSION,
  };
}

export function isShopifyConfigured(): boolean {
  try {
    return shopifyConfig() !== null;
  } catch {
    // A malformed config is still "configured" — we want the error surfaced,
    // not silently swallowed into a mock-data fallback.
    return true;
  }
}
