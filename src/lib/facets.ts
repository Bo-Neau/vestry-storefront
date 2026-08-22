import { SIZE_ORDER, hasStock } from "../data/schema.ts";
import type { Product, Size } from "../data/schema.ts";

/* ---------------------------------------------------------------
   Faceted filtering.

   Two rules that most storefronts get wrong:

   1. SIZE FACETS ARE STOCK-AWARE. A size counts a product only if some
      colorway actually has inventory in that size. The teardown in the
      research found a live store reporting all 59 products under every
      size, because it filtered on "this style is made in M" rather than
      "an M is available to buy". A filter that lies is worse than no
      filter, because it spends trust before it fails.

   2. COUNTS ARE COMPUTED PER GROUP. Within a group, selections are OR'd;
      across groups they're AND'd. A group's own counts ignore that
      group's selections, so numbers show what you'd get if you added
      that option — not zeroes everywhere after the first click.
   --------------------------------------------------------------- */

export const FACET_KEYS = [
  "category", "fit", "neckline", "sleeve", "gender", "size", "color",
] as const;

export type FacetKey = (typeof FACET_KEYS)[number];

export type FilterState = Readonly<Record<FacetKey, readonly string[]>>;

export const EMPTY_FILTERS: FilterState = {
  category: [], fit: [], neckline: [], sleeve: [], gender: [], size: [], color: [],
};

/** Values a product presents for a given facet. */
function valuesFor(p: Product, key: FacetKey): string[] {
  switch (key) {
    case "category": return [p.category];
    case "fit":      return [p.attributes.fit];
    case "neckline": return p.attributes.neckline ? [p.attributes.neckline] : [];
    case "sleeve":   return p.attributes.sleeveLength ? [p.attributes.sleeveLength] : [];
    case "gender":   return [p.attributes.targetGender];
    // Stock-aware: only sizes you can actually buy right now.
    case "size":     return SIZE_ORDER.filter((s) => hasStock(p, s));
    case "color":    return p.colorways.map((c) => c.name);
  }
}

function matchesGroup(p: Product, key: FacetKey, selected: readonly string[]): boolean {
  if (selected.length === 0) return true;               // group inactive
  const values = valuesFor(p, key);
  return selected.some((sel) => values.includes(sel));  // OR within group
}

/** AND across groups, OR within each group. */
export function applyFilters(products: readonly Product[], filters: FilterState): Product[] {
  return products.filter((p) =>
    FACET_KEYS.every((key) => matchesGroup(p, key, filters[key])),
  );
}

export interface FacetOption {
  readonly value: string;
  readonly count: number;
  readonly selected: boolean;
}

/**
 * Count for one option = products matching every OTHER group, plus this
 * option. So counts stay meaningful after the first selection.
 */
export function facetOptions(
  products: readonly Product[],
  filters: FilterState,
  key: FacetKey,
  ordered?: readonly string[],
): FacetOption[] {
  const otherGroups = FACET_KEYS.filter((k) => k !== key);
  const base = products.filter((p) =>
    otherGroups.every((k) => matchesGroup(p, k, filters[k])),
  );

  const counts = new Map<string, number>();
  for (const p of base) {
    for (const v of valuesFor(p, key)) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }

  // Any currently-selected value stays listed even at count 0, so the
  // shopper can always see and undo what they picked.
  for (const sel of filters[key]) {
    if (!counts.has(sel)) counts.set(sel, 0);
  }

  const keys = ordered
    ? ordered.filter((v) => counts.has(v))
    : [...counts.keys()].sort((a, b) => a.localeCompare(b));

  return keys.map((value) => ({
    value,
    count: counts.get(value) ?? 0,
    selected: filters[key].includes(value),
  }));
}

/* ---------------- URL <-> state -------------------------------- */

/** Filters live in the URL, so results are shareable and need no JS. */
export function filtersFromParams(params: URLSearchParams): FilterState {
  const next: Record<FacetKey, string[]> = {
    category: [], fit: [], neckline: [], sleeve: [], gender: [], size: [], color: [],
  };
  for (const key of FACET_KEYS) {
    next[key] = params.getAll(key).filter((v) => v.length > 0);
  }
  return next;
}

export function countActive(filters: FilterState): number {
  return FACET_KEYS.reduce((n, k) => n + filters[k].length, 0);
}

/** Href with one option toggled — plain links, so filters work without JS. */
export function toggleHref(
  basePath: string, filters: FilterState, key: FacetKey, value: string,
): string {
  const params = new URLSearchParams();
  for (const k of FACET_KEYS) {
    const values = k === key
      ? (filters[k].includes(value)
          ? filters[k].filter((v) => v !== value)
          : [...filters[k], value])
      : filters[k];
    for (const v of values) params.append(k, v);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export const SIZE_OPTIONS: readonly Size[] = SIZE_ORDER;
