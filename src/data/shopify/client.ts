import { shopifyConfig } from "../../lib/env.ts";

/**
 * Minimal Storefront API GraphQL client.
 *
 * No SDK: one fetch, typed errors, and a clear message when the store is
 * misconfigured. Shopify returns HTTP 200 with a `errors` array for GraphQL
 * failures, so checking response.ok alone is not enough.
 */

export interface GraphQLError {
  readonly message: string;
  readonly path?: readonly (string | number)[];
  readonly extensions?: { readonly code?: string };
}

export class ShopifyError extends Error {
  // Declared explicitly rather than as a constructor parameter property:
  // parameter properties need real transformation, and Node's strip-only
  // TypeScript mode (used by everything in scripts/ and tests/) rejects them.
  readonly detail: unknown;

  constructor(message: string, detail?: unknown) {
    super(message);
    this.name = "ShopifyError";
    this.detail = detail;
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const config = shopifyConfig();
  if (!config) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and " +
      "SHOPIFY_STOREFRONT_TOKEN in .env (see .env.example).",
    );
  }

  /**
   * HTTPS everywhere except an explicit localhost target, which exists so the
   * integration can be exercised against scripts/mock-shopify.mjs. The check
   * is on the hostname, so a real store can never be downgraded to http by a
   * misconfigured env var.
   */
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(config.domain);
  const scheme = isLocal ? "http" : "https";
  const url = `${scheme}://${config.domain}/api/${config.apiVersion}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.token,
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (cause) {
    throw new ShopifyError(
      `Could not reach ${config.domain}. Check SHOPIFY_STORE_DOMAIN and your network.`,
      cause,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new ShopifyError(
      `Storefront API rejected the token (HTTP ${response.status}). Confirm ` +
      `SHOPIFY_STOREFRONT_TOKEN belongs to ${config.domain} and that the app ` +
      `has the unauthenticated_read_product_listings scope.`,
    );
  }

  if (response.status === 404) {
    throw new ShopifyError(
      `No Storefront API at ${url}. Check the store domain and that ` +
      `SHOPIFY_API_VERSION (${config.apiVersion}) is a supported version.`,
    );
  }

  if (response.status === 430 || response.status === 429) {
    throw new ShopifyError(
      `Rate limited by Shopify (HTTP ${response.status}). Back off and retry.`,
    );
  }

  if (!response.ok) {
    throw new ShopifyError(
      `Storefront API returned HTTP ${response.status} ${response.statusText}.`,
      await response.text().catch(() => undefined),
    );
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors && body.errors.length > 0) {
    const first = body.errors[0]!;
    throw new ShopifyError(
      `Storefront API error: ${first.message}` +
      (first.path ? ` (at ${first.path.join(".")})` : ""),
      body.errors,
    );
  }

  if (!body.data) {
    throw new ShopifyError("Storefront API returned no data.", body);
  }

  return body.data;
}
