/* ---------------------------------------------------------------
   Product schema.

   Deliberately shaped to mirror Shopify's apparel data model so the
   mock layer can be swapped for the Storefront API without touching
   any component:

   - `attributes.*`  -> Shopify PREDEFINED category metafields for
                        Apparel & Accessories > Clothing. Field names
                        match Shopify's taxonomy (neckline, sleeve
                        length type, top length type, fabric, target
                        gender, clothing features).
   - `fit.*`         -> CUSTOM product metafields. modelHeightCm uses
                        Shopify's `dimension` metafield type.
   - `sizeChartId`   -> METAOBJECT reference, so one chart is shared
                        across many products and edited in one place.
   - `colorways[]`   -> Shopify variants, grouped under a STYLE-level
                        id. This grouping is what stops one style
                        appearing in the grid once per colour.
   --------------------------------------------------------------- */

/** Minor units (cents). One currency per storefront — never mix. */
export interface Money {
  readonly amount: number;
  readonly currency: "USD";
}

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

/** Ordered for display. Never sort sizes alphabetically. */
export const SIZE_ORDER: readonly Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export type Fit = "Fitted" | "Tailored" | "Draped" | "Sculptural";
export type Neckline = "High neck" | "Mandarin" | "Collared" | "Round" | "Open";
export type SleeveLength = "Sleeveless" | "Short" | "Three-quarter" | "Long";
export type TargetGender = "Men" | "Women" | "Unisex";
export type Category = "Outerwear" | "Tops" | "Skirts" | "Dresses";
export type GarmentShape = "jacket" | "cape" | "top" | "skirt" | "gown";

/** Mirrors Shopify predefined apparel category metafields. */
export interface ApparelAttributes {
  readonly fit: Fit;
  readonly neckline?: Neckline;
  readonly sleeveLength?: SleeveLength;
  readonly fabric: string;
  readonly fabricWeightGsm: number;
  readonly targetGender: TargetGender;
  readonly features: readonly string[];
}

/**
 * Custom metafields carrying fit confidence.
 *
 * `modelHeightCm` + `modelSizeWorn` render the single highest-value
 * line on a clothing PDP. Cheap to display, impossible to backfill
 * without reshooting — so it is required, not optional.
 */
export interface FitMetadata {
  readonly modelHeightCm: number;
  readonly modelSizeWorn: Size;
  /** Aggregate of review fit feedback. Drives the "runs small/large" note. */
  readonly runsTrueToSize: "small" | "true" | "large";
}

/** Stock at the size level. The only honest basis for a size filter. */
export interface SizeStock {
  readonly size: Size;
  readonly inventory: number;
  /**
   * Platform variant id (a Shopify GID) — the thing a real cart adds.
   *
   * Absent on sample data, where the cart falls back to a synthetic key built
   * from handle + colourway + size. That key is only ever a lookup into the
   * catalogue; it is never trusted for price.
   */
  readonly variantId?: string;
}

/**
 * One photographed view of a garment.
 *
 * `width`/`height` are REQUIRED, not optional. Without intrinsic dimensions
 * the browser cannot reserve space before the image loads, and the page
 * reflows as each one arrives — Cumulative Layout Shift. On a product grid
 * that is the difference between a stable page and one that jumps under the
 * shopper's finger as they reach for a card.
 */
export interface ProductImage {
  /** Provider-agnostic source. The CDN layer adds sizing and format. */
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** front | back | flat | detail — drives gallery ordering and alt text. */
  readonly view: "front" | "back" | "flat" | "detail";
}

export interface Colorway {
  readonly id: string;
  readonly name: string;
  /** Swatch fill. Shown WITH the name — neither is sufficient alone. */
  readonly hex: string;
  /** Second hex for heathered/marled yarns, rendered as a subtle blend. */
  readonly hexAlt?: string;
  readonly sizes: readonly SizeStock[];
  /**
   * Photography for this colourway. Absent means the placeholder renderer is
   * used, so the storefront works before a shoot is booked.
   */
  readonly images?: readonly ProductImage[];
}

export type ReviewFit = "small" | "true" | "large";

export interface Review {
  readonly id: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly title: string;
  readonly body: string;
  readonly author: string;
  readonly verified: boolean;
  readonly date: string;
  /** Fit fields are the reason apparel reviews exist. Never optional. */
  readonly heightBand: string;
  readonly sizePurchased: Size;
  readonly fitFeedback: ReviewFit;
}

export interface SizeChartRow {
  readonly size: Size;
  readonly chestCm: number;
  readonly waistCm: number;
  readonly lengthCm: number;
}

/** Shopify metaobject: authored once, referenced by many products. */
export interface SizeChart {
  readonly id: string;
  readonly name: string;
  /** Garment measurements laid flat, not body measurements. Say which. */
  readonly rows: readonly SizeChartRow[];
  readonly howToMeasure: readonly { part: string; instruction: string }[];
}

export interface Product {
  /** STYLE-level id, distinct from any variant SKU. Enables grouping. */
  readonly id: string;
  /**
   * The designer who made this piece.
   *
   * Not decoration for this brand: the booklet credits a named designer on
   * almost every page, and the house is a collective rather than one hand.
   * Dropping the credit would misrepresent how the work is made.
   */
  readonly designer?: string;
  /** Collection the piece belongs to — Hope, Crimson Drive, and so on. */
  readonly collection?: string;
  /** Credit for hand-painting or hand-work, where a separate artist did it. */
  readonly artist?: string;
  /**
   * Raw platform id (e.g. a Shopify product gid).
   *
   * Kept separate from `id` because `id` may be a merchant-authored style
   * code. External services — reviews, search, analytics — key off the
   * platform's own id, so joining them needs it verbatim.
   */
  readonly platformId?: string;
  readonly handle: string;
  readonly title: string;
  readonly category: Category;
  readonly shape: GarmentShape;
  readonly price: Money;
  readonly compareAtPrice?: Money;
  readonly summary: string;
  readonly description: string;
  readonly attributes: ApparelAttributes;
  readonly fit: FitMetadata;
  readonly sizeChartId: string;
  readonly colorways: readonly Colorway[];
  readonly care: readonly string[];
  readonly details: readonly string[];
  readonly reviews: readonly Review[];
}

/* ---------------- derived helpers (pure, no I/O) ---------------- */

export function inventoryFor(p: Product, size: Size): number {
  return p.colorways.reduce((total, c) => {
    const row = c.sizes.find((s) => s.size === size);
    return total + (row ? row.inventory : 0);
  }, 0);
}

/** True only if some colorway actually has stock in that size. */
export function hasStock(p: Product, size: Size): boolean {
  return inventoryFor(p, size) > 0;
}

export function sizesInStock(p: Product): Size[] {
  return SIZE_ORDER.filter((s) => hasStock(p, s));
}

export function totalInventory(p: Product): number {
  return p.colorways.reduce(
    (t, c) => t + c.sizes.reduce((n, s) => n + s.inventory, 0),
    0,
  );
}

export function averageRating(p: Product): number {
  if (p.reviews.length === 0) return 0;
  const sum = p.reviews.reduce((t, r) => t + r.rating, 0);
  return sum / p.reviews.length;
}

/** Full distribution, so 1- and 2-star counts stay visible. */
export function ratingDistribution(p: Product): Record<1|2|3|4|5, number> {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1|2|3|4|5, number>;
  for (const r of p.reviews) dist[r.rating] += 1;
  return dist;
}

/** Majority fit verdict from reviews — the "runs large" warning. */
export function fitVerdict(p: Product): { verdict: ReviewFit; share: number } {
  if (p.reviews.length === 0) return { verdict: "true", share: 0 };
  const counts: Record<ReviewFit, number> = { small: 0, true: 0, large: 0 };
  for (const r of p.reviews) counts[r.fitFeedback] += 1;
  const entries = Object.entries(counts) as [ReviewFit, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [verdict, n] = entries[0];
  return { verdict, share: n / p.reviews.length };
}
