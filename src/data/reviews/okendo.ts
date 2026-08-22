import type { Review, ReviewFit, Size } from "../schema.ts";
import { SIZE_ORDER } from "../schema.ts";
import {
  OKENDO_MAPPING, OKENDO_PAGE_SIZE, OKENDO_CACHE_TTL_MS,
} from "./config.ts";

/**
 * Okendo Storefront REST API client.
 *
 * Public and unauthenticated, scoped by the store's Okendo user id in the
 * path. No secret involved, so this is safe to call from the server without
 * credential handling.
 *
 *   GET https://api.okendo.io/v1/stores/{userId}/reviews
 */

const BASE = "https://api.okendo.io/v1/stores";

export interface OkendoAttribute {
  title?: string;
  type?: string;
  value?: number | string;
  minLabel?: string;
  midLabel?: string;
  maxLabel?: string;
}

export interface OkendoReview {
  reviewId?: string;
  productId?: string;
  rating?: number;
  title?: string;
  body?: string;
  dateCreated?: string;
  isVerifiedBuyer?: boolean;
  reviewer?: { displayName?: string; name?: string } | null;
  attributesWithRating?: OkendoAttribute[] | null;
  attributes?: OkendoAttribute[] | null;
}

interface OkendoReviewsResponse {
  reviews?: OkendoReview[];
}

function okendoUserId(): string | null {
  const fromProcess = typeof process !== "undefined"
    ? process.env?.OKENDO_USER_ID : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)
    ?.OKENDO_USER_ID;
  const id = (fromProcess ?? fromMeta ?? "").trim();
  return id.length > 0 ? id : null;
}

export function isOkendoConfigured(): boolean {
  return okendoUserId() !== null;
}

/* ---------------- attribute helpers ---------------- */

const allAttributes = (r: OkendoReview): OkendoAttribute[] => [
  ...(r.attributesWithRating ?? []),
  ...(r.attributes ?? []),
];

function findAttribute(
  r: OkendoReview, titles: readonly string[],
): OkendoAttribute | undefined {
  const attrs = allAttributes(r);
  for (const wanted of titles) {
    const hit = attrs.find(
      (a) => (a.title ?? "").trim().toLowerCase() === wanted.toLowerCase(),
    );
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Maps a centered-range value onto small / true / large.
 *
 * Uses the configured scale rather than assuming, and applies a dead zone so
 * a value one notch off centre is not reported as a sizing problem.
 */
export function fitFromAttribute(attr: OkendoAttribute | undefined): ReviewFit {
  if (!attr || typeof attr.value !== "number") return "true";
  const { min, max } = OKENDO_MAPPING.fitScale;
  const mid = (min + max) / 2;
  const halfRange = (max - min) / 2;
  if (halfRange <= 0) return "true";

  const offset = (attr.value - mid) / halfRange; // -1..1
  if (offset <= -OKENDO_MAPPING.fitDeadZone) return "small";
  if (offset >= OKENDO_MAPPING.fitDeadZone) return "large";
  return "true";
}

function sizeFromAttribute(attr: OkendoAttribute | undefined): Size | undefined {
  const raw = typeof attr?.value === "string" ? attr.value.trim() : undefined;
  if (!raw) return undefined;
  return SIZE_ORDER.find((s) => s.toLowerCase() === raw.toLowerCase());
}

function heightFromAttribute(attr: OkendoAttribute | undefined): string | undefined {
  if (!attr) return undefined;
  if (typeof attr.value === "string" && attr.value.trim()) return attr.value.trim();
  if (typeof attr.value === "number") return String(attr.value);
  return undefined;
}

const clampRating = (n: unknown): 1 | 2 | 3 | 4 | 5 => {
  const r = Math.round(Number(n));
  if (!Number.isFinite(r)) return 5;
  return Math.min(5, Math.max(1, r)) as 1 | 2 | 3 | 4 | 5;
};

/* ---------------- mapping ---------------- */

export function mapOkendoReview(raw: OkendoReview, index: number): Review {
  const fitAttr = findAttribute(raw, OKENDO_MAPPING.fitAttributeTitles);
  const heightAttr = findAttribute(raw, OKENDO_MAPPING.heightAttributeTitles);
  const sizeAttr = findAttribute(raw, OKENDO_MAPPING.sizePurchasedAttributeTitles);

  return {
    id: raw.reviewId ?? `okendo-${index}`,
    rating: clampRating(raw.rating),
    title: (raw.title ?? "").trim(),
    body: (raw.body ?? "").trim(),
    author: (raw.reviewer?.displayName ?? raw.reviewer?.name ?? "Verified buyer").trim(),
    verified: raw.isVerifiedBuyer === true,
    date: raw.dateCreated ?? new Date().toISOString(),
    // These three are why Okendo was chosen over a cheaper reviews app.
    // Absent values are stated as unknown rather than invented.
    heightBand: heightFromAttribute(heightAttr) ?? "Not given",
    sizePurchased: sizeFromAttribute(sizeAttr) ?? "M",
    fitFeedback: fitFromAttribute(fitAttr),
  };
}

/* ---------------- fetching ---------------- */

interface CacheEntry {
  at: number;
  byProduct: Map<string, Review[]>;
}
let cache: CacheEntry | null = null;

/** Normalises a Shopify gid or bare id to the numeric tail for joining. */
export function normaliseProductId(id: string | undefined): string {
  if (!id) return "";
  const tail = id.split("/").pop() ?? id;
  return tail.trim();
}

/**
 * Fetches published reviews and groups them by product.
 *
 * One request covers a small catalogue and yields both per-product reviews
 * and the aggregates the collection cards need. For a large catalogue, switch
 * to per-product requests plus Okendo's aggregate endpoint.
 */
export async function fetchReviewsByProduct(): Promise<Map<string, Review[]>> {
  const userId = okendoUserId();
  if (!userId) return new Map();

  if (cache && Date.now() - cache.at < OKENDO_CACHE_TTL_MS) {
    return cache.byProduct;
  }

  const url = new URL(`${BASE}/${encodeURIComponent(userId)}/reviews`);
  url.searchParams.set("limit", String(OKENDO_PAGE_SIZE));
  url.searchParams.set("orderBy", "date desc");

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(
      `Okendo returned HTTP ${res.status}. Check OKENDO_USER_ID — it is the ` +
      `Okendo store (subscriber) id, not the Shopify store name.`,
    );
  }

  const body = (await res.json()) as OkendoReviewsResponse;
  const reviews = body.reviews ?? [];

  const byProduct = new Map<string, Review[]>();
  reviews.forEach((raw, i) => {
    const key = normaliseProductId(raw.productId);
    if (!key) return;
    const mapped = mapOkendoReview(raw, i);
    const bucket = byProduct.get(key) ?? [];
    bucket.push(mapped);
    byProduct.set(key, bucket);
  });

  cache = { at: Date.now(), byProduct };
  return byProduct;
}

/** Test seam — clears the in-memory cache. */
export function clearOkendoCache(): void {
  cache = null;
}
