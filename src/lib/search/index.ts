/**
 * Search provider seam.
 *
 * The in-memory implementation in src/lib/facets.ts stays the reference: it is
 * readable, has no infrastructure, and is what the index is verified against
 * by `npm run search:doctor`. Typesense takes over when configured.
 *
 * Both paths must produce identical filtering semantics — OR within a facet
 * group, AND across groups, and counts that ignore their own group. If they
 * ever diverge, a filter means different things depending on which path served
 * the page, which is worse than either behaviour on its own.
 */
import type { Product } from "../../data/schema.ts";
import { SIZE_ORDER } from "../../data/schema.ts";
import { FACET_KEYS, facetOptions, applyFilters } from "../facets.ts";
import type { FacetKey, FacetOption, FilterState } from "../facets.ts";
import { search, isSearchConfigured } from "./typesense.ts";

export type SearchBackend = "typesense" | "memory";

export interface CatalogueQuery {
  readonly all: readonly Product[];
  readonly filters: FilterState;
  /** Restrict to one collection, e.g. "Shirts". */
  readonly category?: string | undefined;
}

export interface CatalogueResult {
  readonly products: readonly Product[];
  readonly facets: Record<FacetKey, FacetOption[]>;
  readonly backend: SearchBackend;
  readonly warning?: string;
}

const ORDERED: Partial<Record<FacetKey, readonly string[]>> = {
  size: SIZE_ORDER,
  fit: ["Slim", "Regular", "Relaxed", "Oversized"],
  sleeve: ["Sleeveless", "Short", "Long"],
  gender: ["Men", "Women", "Unisex"],
};

/** In-memory path: the reference implementation. */
function memoryQuery(query: CatalogueQuery): CatalogueResult {
  const scoped = query.category
    ? query.all.filter((p) => p.category === query.category)
    : query.all;

  const facets = Object.fromEntries(
    FACET_KEYS.map((key) => [
      key,
      facetOptions(scoped, query.filters, key, ORDERED[key]),
    ]),
  ) as Record<FacetKey, FacetOption[]>;

  return {
    products: applyFilters(scoped, query.filters),
    facets,
    backend: "memory",
  };
}

/** Index path. Falls back to memory on any failure rather than erroring. */
async function typesenseQuery(query: CatalogueQuery): Promise<CatalogueResult> {
  const scope = query.category ? `category:=[\`${query.category}\`]` : undefined;
  const response = await search({ filters: query.filters, scope });

  /**
   * The index returns which handles match. Cards are hydrated from the already
   * loaded product set, so rendering is unchanged.
   *
   * At real catalogue size you would render cards straight from the index
   * document and stop loading every product — the document carries everything
   * a card needs. Hydration is only free here because the set is small.
   */
  const byHandle = new Map(query.all.map((p) => [p.handle, p]));
  const products = response.documents
    .map((d) => byHandle.get(d.handle))
    .filter((p): p is Product => p !== undefined);

  const facets = Object.fromEntries(
    FACET_KEYS.map((key) => {
      const counts = response.facets[key];
      const selected = query.filters[key];
      const ordered = ORDERED[key];

      // Selected values stay listed even at count 0, so a shopper can always
      // see and undo what they picked.
      const values = new Set<string>([...counts.keys(), ...selected]);
      const list = ordered
        ? ordered.filter((v) => values.has(v))
        : [...values].sort((a, b) => a.localeCompare(b));

      return [
        key,
        list
          // "—" is the placeholder for an absent attribute, not a real choice.
          .filter((value) => value !== "—")
          .map((value) => ({
            value,
            count: counts.get(value) ?? 0,
            selected: selected.includes(value),
          })),
      ];
    }),
  ) as Record<FacetKey, FacetOption[]>;

  return { products, facets, backend: "typesense" };
}

export async function queryCatalogue(query: CatalogueQuery): Promise<CatalogueResult> {
  if (!isSearchConfigured()) return memoryQuery(query);
  try {
    return await typesenseQuery(query);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[search] Typesense query failed, using in-memory filtering:\n  ${message}`);
    return { ...memoryQuery(query), warning: `Search index unavailable: ${message}` };
  }
}
