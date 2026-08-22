import { SIZE_ORDER, hasStock, averageRating, totalInventory } from "../../data/schema.ts";
import type { Product } from "../../data/schema.ts";

/**
 * The indexed representation of a style.
 *
 * The field that matters is `sizes_in_stock`. It is computed from real
 * per-size inventory at index time — NOT from the sizes the style is made in.
 *
 * The research teardown found a live store whose size facet reported all 59
 * products under every size, because it indexed "this style exists in M"
 * rather than "an M is available to buy". A filter that lies is worse than no
 * filter, because it spends the shopper's trust before it fails. Indexing the
 * wrong field is exactly how that bug gets built, so it is named explicitly.
 *
 * This also means the index MUST be rebuilt on inventory change, not just on
 * product edits. See docs/search-setup.md.
 */
export interface ProductDocument {
  readonly id: string;
  readonly handle: string;
  readonly title: string;
  readonly summary: string;
  readonly category: string;
  readonly fit: string;
  readonly neckline: string;
  readonly sleeve: string;
  readonly gender: string;
  readonly fabric: string;
  readonly colours: string[];
  /** Sizes a shopper can actually buy right now. */
  readonly sizes_in_stock: string[];
  /** Sizes the style is made in. Indexed for reporting — never faceted on. */
  readonly sizes_made: string[];
  readonly price: number;
  readonly fabric_weight_gsm: number;
  readonly rating: number;
  readonly review_count: number;
  readonly total_inventory: number;
  readonly indexed_at: number;
}

/** Typesense facets on empty strings fine, but "" reads badly in a UI. */
const NONE = "—";

export function toDocument(product: Product, now = Date.now()): ProductDocument {
  return {
    id: product.handle,
    handle: product.handle,
    title: product.title,
    summary: product.summary,
    category: product.category,
    fit: product.attributes.fit,
    neckline: product.attributes.neckline ?? NONE,
    sleeve: product.attributes.sleeveLength ?? NONE,
    gender: product.attributes.targetGender,
    fabric: product.attributes.fabric,
    colours: product.colorways.map((c) => c.name),
    sizes_in_stock: SIZE_ORDER.filter((s) => hasStock(product, s)),
    sizes_made: product.colorways
      .flatMap((c) => c.sizes.map((s) => s.size))
      .filter((s, i, arr) => arr.indexOf(s) === i),
    price: product.price.amount,
    fabric_weight_gsm: product.attributes.fabricWeightGsm,
    rating: Number(averageRating(product).toFixed(2)),
    review_count: product.reviews.length,
    total_inventory: totalInventory(product),
    indexed_at: now,
  };
}

/**
 * Typesense collection schema.
 *
 * `sizes_made` is deliberately NOT faceted. Indexing it keeps it available
 * for merchandising reports, while making it impossible to accidentally build
 * the dishonest filter.
 */
export const COLLECTION_SCHEMA = {
  name: "products",
  enable_nested_fields: false,
  fields: [
    { name: "handle", type: "string" },
    { name: "title", type: "string" },
    { name: "summary", type: "string" },
    { name: "category", type: "string", facet: true },
    { name: "fit", type: "string", facet: true },
    { name: "neckline", type: "string", facet: true },
    { name: "sleeve", type: "string", facet: true },
    { name: "gender", type: "string", facet: true },
    { name: "fabric", type: "string", facet: true },
    { name: "colours", type: "string[]", facet: true },
    { name: "sizes_in_stock", type: "string[]", facet: true },
    { name: "sizes_made", type: "string[]", facet: false, optional: true },
    { name: "price", type: "int32", facet: false, sort: true },
    { name: "fabric_weight_gsm", type: "int32", facet: false, sort: true },
    { name: "rating", type: "float", facet: false, sort: true },
    { name: "review_count", type: "int32", facet: false, sort: true },
    { name: "total_inventory", type: "int32", facet: false, sort: true },
    { name: "indexed_at", type: "int64", facet: false, sort: true },
  ],
  default_sorting_field: "total_inventory",
} as const;

/** Facet key in our URLs -> field name in the index. */
export const FACET_FIELD: Record<string, string> = {
  category: "category",
  fit: "fit",
  neckline: "neckline",
  sleeve: "sleeve",
  gender: "gender",
  color: "colours",
  size: "sizes_in_stock",
};

/** Display order for size facets. Typesense returns them by count. */
export const SIZE_DISPLAY_ORDER: readonly string[] = SIZE_ORDER;
