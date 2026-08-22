/**
 * Reviews provider seam.
 *
 * Reviews are deliberately NOT part of the commerce data. They come from a
 * dedicated platform because the value is in collection, moderation, request
 * timing and structured fit attributes — all of which are somebody's whole
 * product, and none of which you want to rebuild.
 *
 * Swapping Okendo for Junip or Yotpo means implementing one interface here.
 */
import type { Product, Review } from "../schema.ts";
import { fetchReviewsByProduct, isOkendoConfigured, normaliseProductId } from "./okendo.ts";

export type ReviewProviderName = "okendo" | "sample" | "none";

export function reviewProviderName(): ReviewProviderName {
  return isOkendoConfigured() ? "okendo" : "sample";
}

/**
 * Attaches reviews to products from the configured provider.
 *
 * Products arriving from Shopify carry `reviews: []` — the commerce API has
 * no reviews to give. This is where they get filled in.
 *
 * On failure the products are returned unchanged with a warning rather than
 * throwing: a reviews outage should degrade the page, not take down the shop.
 */
export async function attachReviews(
  products: readonly Product[],
): Promise<{ products: readonly Product[]; provider: ReviewProviderName; warning?: string }> {
  if (!isOkendoConfigured()) {
    // Sample products already carry their own reviews.
    return { products, provider: "sample" };
  }

  try {
    const byProduct = await fetchReviewsByProduct();
    if (byProduct.size === 0) {
      return {
        products,
        provider: "okendo",
        warning: "Okendo returned no published reviews. Reviews render empty until some exist.",
      };
    }

    const merged = products.map((p) => {
      const key = normaliseProductId(p.platformId ?? p.id);
      const reviews: Review[] = byProduct.get(key) ?? [];
      return { ...p, reviews };
    });

    return { products: merged, provider: "okendo" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[reviews] Okendo fetch failed, rendering without reviews:\n  ${message}`);
    return {
      products: products.map((p) => ({ ...p, reviews: [] })),
      provider: "okendo",
      warning: `Okendo unavailable: ${message}`,
    };
  }
}

export async function attachReviewsToProduct(
  product: Product,
): Promise<{ product: Product; provider: ReviewProviderName }> {
  const { products, provider } = await attachReviews([product]);
  return { product: products[0] ?? product, provider };
}
