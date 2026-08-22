/**
 * The Typesense filter builder is pure string construction, and a wrong
 * operator silently changes what a filter means — `:=` is exact match while
 * `:` is a contains-style match, so "S" would match "XS" and "XXS".
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFilter, filterClause } from "../src/lib/search/typesense.ts";
import { EMPTY_FILTERS } from "../src/lib/facets.ts";
import { toDocument, COLLECTION_SCHEMA, FACET_FIELD } from "../src/lib/search/document.ts";
import { PRODUCTS } from "../src/data/catalogue.ts";
import { SIZE_ORDER, hasStock } from "../src/data/schema.ts";

test("no filters produces an empty clause, not a malformed one", () => {
  assert.equal(buildFilter(EMPTY_FILTERS), "");
});

test("uses exact match so S does not match XS or XXS", () => {
  const clause = filterClause("size", ["S"]);
  assert.ok(clause.includes(":="), `expected exact-match operator, got: ${clause}`);
  assert.equal(clause, "sizes_in_stock:=[`S`]");
});

test("multiple values in one group are OR'd", () => {
  assert.equal(filterClause("size", ["S", "M"]), "sizes_in_stock:=[`S`,`M`]");
});

test("groups are AND'd together", () => {
  const f = { ...EMPTY_FILTERS, size: ["XXL"], fit: ["Relaxed"] };
  const built = buildFilter(f);
  assert.ok(built.includes(" && "), `expected AND between groups: ${built}`);
  assert.ok(built.includes("sizes_in_stock:=[`XXL`]"));
  assert.ok(built.includes("fit:=[`Relaxed`]"));
});

test("skip omits one group, for disjunctive facet counts", () => {
  const f = { ...EMPTY_FILTERS, size: ["XXL"], fit: ["Relaxed"] };
  const built = buildFilter(f, "size");
  assert.ok(!built.includes("sizes_in_stock"), `size should be omitted: ${built}`);
  assert.ok(built.includes("fit:=[`Relaxed`]"));
});

test("size facets map to the in-stock field, never sizes_made", () => {
  // The single most important line in the search integration.
  assert.equal(FACET_FIELD.size, "sizes_in_stock");
});

test("sizes_made is indexed but NOT facetable", () => {
  const field = COLLECTION_SCHEMA.fields.find((f) => f.name === "sizes_made");
  assert.ok(field, "sizes_made should be indexed for reporting");
  assert.equal(field.facet, false,
    "sizes_made must not be facetable, or the dishonest filter becomes buildable");
});

test("documents carry only sizes a shopper can actually buy", () => {
  for (const p of PRODUCTS) {
    const doc = toDocument(p);
    const expected = SIZE_ORDER.filter((s) => hasStock(p, s));
    assert.deepEqual(doc.sizes_in_stock, expected, `${p.handle}`);
    // And a sold-out size must be absent from the facet field but present in made.
    for (const size of SIZE_ORDER) {
      if (!hasStock(p, size)) {
        assert.ok(!doc.sizes_in_stock.includes(size),
          `${p.handle}: ${size} is sold out but appears in sizes_in_stock`);
      }
    }
  }
});

test("the sample data actually exercises the difference", () => {
  // A test that passes only because nothing is sold out proves nothing.
  const differing = PRODUCTS.filter((p) => {
    const doc = toDocument(p);
    return doc.sizes_in_stock.length !== doc.sizes_made.length;
  });
  assert.ok(differing.length > 0,
    "no product has a sold-out size — the stock-aware test is vacuous");
});
