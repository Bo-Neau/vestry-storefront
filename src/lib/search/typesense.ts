import { FACET_FIELD } from "./document.ts";
import type { ProductDocument } from "./document.ts";
import { FACET_KEYS } from "../facets.ts";
import type { FacetKey, FilterState } from "../facets.ts";

/**
 * Typesense client and query builder.
 *
 * DISJUNCTIVE FACETING
 *
 * Typesense applies every filter before counting facets, so a single query
 * would return count 0 for every unselected option in a group the shopper has
 * already filtered on — the classic "all my other choices vanished" bug.
 *
 * The fix is one search per active facet group, each omitting its OWN filter
 * while keeping the others, sent together via multi_search. That reproduces
 * the semantics of the in-memory implementation: OR within a group, AND
 * across groups, and counts that show what you would get if you added an
 * option.
 */

export interface TypesenseConfig {
  readonly url: string;
  readonly apiKey: string;
  readonly collection: string;
}

function read(key: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)?.[key];
  const v = (fromProcess ?? fromMeta ?? "").trim();
  return v.length > 0 ? v : undefined;
}

export function typesenseConfig(): TypesenseConfig | null {
  const url = read("TYPESENSE_URL");
  const apiKey = read("TYPESENSE_SEARCH_KEY");
  if (!url || !apiKey) return null;

  /**
   * Refuse an admin key on the read path. A search-only key can be exposed;
   * an admin key can delete the index. Same reasoning as the Shopify guard.
   */
  if (read("TYPESENSE_ADMIN_KEY") && apiKey === read("TYPESENSE_ADMIN_KEY")) {
    throw new Error(
      "TYPESENSE_SEARCH_KEY is the same value as TYPESENSE_ADMIN_KEY. Use a " +
      "search-only key for queries — an admin key can drop the collection. " +
      "Create one with `npm run search:keys`.",
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    apiKey,
    collection: read("TYPESENSE_COLLECTION") ?? "products",
  };
}

export const isSearchConfigured = (): boolean => {
  try { return typesenseConfig() !== null; } catch { return true; }
};

/* ---------------- filter building ---------------- */

/** Typesense filter values are comma-separated inside [] and need escaping. */
const escapeValue = (v: string): string => `\`${v.replace(/`/g, "")}\``;

export function filterClause(key: FacetKey, values: readonly string[]): string | null {
  if (values.length === 0) return null;
  const field = FACET_FIELD[key];
  if (!field) return null;
  return `${field}:=[${values.map(escapeValue).join(",")}]`;
}

/** AND across groups; `skip` omits one group for disjunctive faceting. */
export function buildFilter(filters: FilterState, skip?: FacetKey): string {
  const clauses: string[] = [];
  for (const key of FACET_KEYS) {
    if (key === skip) continue;
    const clause = filterClause(key, filters[key]);
    if (clause) clauses.push(clause);
  }
  return clauses.join(" && ");
}

/* ---------------- search ---------------- */

export interface TypesenseFacetCount {
  field_name: string;
  counts: { value: string; count: number }[];
}

export interface TypesenseResult {
  found: number;
  hits: { document: ProductDocument }[];
  facet_counts?: TypesenseFacetCount[];
}

interface MultiSearchResponse {
  results: (TypesenseResult & { error?: string; code?: number })[];
}

export interface SearchRequest {
  readonly filters: FilterState;
  /** Restricts to a collection page, e.g. `category:=[\`Shirts\`]`. */
  readonly scope?: string;
  readonly query?: string;
  readonly perPage?: number;
}

export interface SearchResponse {
  readonly documents: ProductDocument[];
  readonly found: number;
  /** facet key -> value -> count */
  readonly facets: Record<FacetKey, Map<string, number>>;
}

const join = (...parts: (string | undefined | null)[]): string =>
  parts.filter((p): p is string => Boolean(p && p.length > 0)).join(" && ");

export async function search(req: SearchRequest): Promise<SearchResponse> {
  const config = typesenseConfig();
  if (!config) throw new Error("Typesense is not configured. See .env.example.");

  const facetFields = FACET_KEYS.map((k) => FACET_FIELD[k]).filter(Boolean).join(",");
  const common = {
    collection: config.collection,
    q: req.query && req.query.length > 0 ? req.query : "*",
    query_by: "title,summary,fabric,colours",
    facet_by: facetFields,
    max_facet_values: 50,
    per_page: req.perPage ?? 60,
  };

  /**
   * Query 0 returns the actual result set with every filter applied.
   * Queries 1..n each drop one group's own filter so its counts stay useful.
   */
  const searches: Record<string, unknown>[] = [
    { ...common, filter_by: join(req.scope, buildFilter(req.filters)) },
  ];
  const facetOrder: FacetKey[] = [];
  for (const key of FACET_KEYS) {
    if (req.filters[key].length === 0) continue;
    facetOrder.push(key);
    searches.push({
      ...common,
      filter_by: join(req.scope, buildFilter(req.filters, key)),
      facet_by: FACET_FIELD[key]!,
      per_page: 0,
    });
  }

  const res = await fetch(`${config.url}/multi_search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": config.apiKey,
    },
    body: JSON.stringify({ searches }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Typesense rejected the key. Check TYPESENSE_SEARCH_KEY.");
  }
  if (!res.ok) {
    throw new Error(`Typesense HTTP ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const body = (await res.json()) as MultiSearchResponse;
  const primary = body.results[0];
  if (!primary || primary.error) {
    throw new Error(`Typesense search failed: ${primary?.error ?? "no result"}`);
  }

  const facets = Object.fromEntries(
    FACET_KEYS.map((k) => [k, new Map<string, number>()]),
  ) as Record<FacetKey, Map<string, number>>;

  const absorb = (result: TypesenseResult | undefined, only?: FacetKey) => {
    for (const fc of result?.facet_counts ?? []) {
      const key = (FACET_KEYS as readonly FacetKey[]).find(
        (k) => FACET_FIELD[k] === fc.field_name,
      );
      if (!key) continue;
      if (only && key !== only) continue;
      // A per-group query is authoritative for its own group.
      const target = facets[key];
      if (only) target.clear();
      for (const c of fc.counts) target.set(c.value, c.count);
    }
  };

  absorb(primary);
  facetOrder.forEach((key, i) => absorb(body.results[i + 1], key));

  return {
    documents: primary.hits.map((h) => h.document),
    found: primary.found,
    facets,
  };
}

export async function health(): Promise<boolean> {
  const config = typesenseConfig();
  if (!config) return false;
  try {
    const res = await fetch(`${config.url}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
