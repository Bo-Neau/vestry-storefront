/**
 * The single seam between the storefront and its data.
 *
 * Pages call this; nothing else knows whether products come from Shopify or
 * the local sample catalogue. Falls back to sample data when Shopify is
 * unconfigured, so the app is always runnable — including before the client
 * has a store.
 */
import type { Product, SizeChart } from "./schema.ts";
import { PRODUCTS, productByHandle as mockByHandle } from "./catalogue.ts";
import { sizeChartById as mockChart } from "./size-charts.ts";
import { isShopifyConfigured } from "../lib/env.ts";
import { storefront, ShopifyError } from "./shopify/client.ts";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./shopify/queries.ts";
import { mapProduct, cachedSizeChart } from "./shopify/map.ts";
import type { RawProduct } from "./shopify/map.ts";
import { attachReviews } from "./reviews/index.ts";
import type { ReviewProviderName } from "./reviews/index.ts";

interface ProductsResponse {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: RawProduct[];
  };
}

export interface CatalogueSource {
  readonly name: "shopify" | "sample";
  listProducts(): Promise<readonly Product[]>;
  productByHandle(handle: string): Promise<Product | undefined>;
  sizeChart(id: string): Promise<SizeChart | undefined>;
}

/* ---------------- sample ---------------- */

const sampleSource: CatalogueSource = {
  name: "sample",
  async listProducts() { return PRODUCTS; },
  async productByHandle(handle) { return mockByHandle(handle); },
  async sizeChart(id) {
    try { return mockChart(id); } catch { return undefined; }
  },
};

/* ---------------- shopify ---------------- */

const shopifySource: CatalogueSource = {
  name: "shopify",

  async listProducts() {
    const out: Product[] = [];
    let cursor: string | null = null;

    // Page through everything. A clothing range is small; correctness beats
    // cleverness here.
    for (let page = 0; page < 20; page += 1) {
      const data: ProductsResponse = await storefront<ProductsResponse>(
        PRODUCTS_QUERY, { first: 50, cursor },
      );

      out.push(...data.products.nodes.map(mapProduct));
      if (!data.products.pageInfo.hasNextPage) break;
      cursor = data.products.pageInfo.endCursor;
    }
    return out;
  },

  async productByHandle(handle) {
    const data = await storefront<{ product: RawProduct | null }>(
      PRODUCT_BY_HANDLE_QUERY, { handle },
    );
    return data.product ? mapProduct(data.product) : undefined;
  },

  async sizeChart(id) {
    // Populated as a side effect of mapping the product that references it.
    return cachedSizeChart(id);
  },
};

/* ---------------- selection ---------------- */

export function getSource(): CatalogueSource {
  return isShopifyConfigured() ? shopifySource : sampleSource;
}

/**
 * Reads from Shopify, and falls back to sample data if the store is
 * unreachable — with a loud server log rather than a silent swap, so a broken
 * integration is visible in development instead of looking like it works.
 */
export async function loadProducts(): Promise<{
  products: readonly Product[];
  source: CatalogueSource["name"];
  reviewProvider: ReviewProviderName;
  warning?: string;
}> {
  const source = getSource();
  if (source.name === "sample") {
    const withReviews = await attachReviews(await source.listProducts());
    return {
      products: withReviews.products,
      source: "sample",
      reviewProvider: withReviews.provider,
      ...(withReviews.warning ? { warning: withReviews.warning } : {}),
    };
  }
  try {
    const products = await source.listProducts();
    if (products.length === 0) {
      const fallback = await attachReviews(await sampleSource.listProducts());
      return {
        products: fallback.products,
        source: "sample",
        reviewProvider: fallback.provider,
        warning: "Shopify returned no products. Showing sample data. Run `npm run shopify:seed` to populate the dev store.",
      };
    }
    const withReviews = await attachReviews(products);
    return {
      products: withReviews.products,
      source: "shopify",
      reviewProvider: withReviews.provider,
      ...(withReviews.warning ? { warning: withReviews.warning } : {}),
    };
  } catch (error) {
    const message = error instanceof ShopifyError ? error.message : String(error);
    console.error(`[source] Shopify read failed, falling back to sample data:\n  ${message}`);
    const fallback = await attachReviews(await sampleSource.listProducts());
    return {
      products: fallback.products,
      source: "sample",
      reviewProvider: fallback.provider,
      warning: `Shopify unavailable: ${message}`,
    };
  }
}

export async function loadProduct(handle: string): Promise<{
  product: Product | undefined;
  source: CatalogueSource["name"];
}> {
  const source = getSource();
  if (source.name === "sample") {
    return { product: await source.productByHandle(handle), source: "sample" };
  }
  try {
    const product = await source.productByHandle(handle);
    if (product) {
      const withReviews = await attachReviews([product]);
      return { product: withReviews.products[0] ?? product, source: "shopify" };
    }
    return { product: await sampleSource.productByHandle(handle), source: "sample" };
  } catch (error) {
    const message = error instanceof ShopifyError ? error.message : String(error);
    console.error(`[source] Shopify read failed for "${handle}":\n  ${message}`);
    return { product: await sampleSource.productByHandle(handle), source: "sample" };
  }
}

export async function loadSizeChart(id: string): Promise<SizeChart | undefined> {
  const source = getSource();
  const chart = await source.sizeChart(id);
  if (chart) return chart;
  return sampleSource.sizeChart(id);
}
