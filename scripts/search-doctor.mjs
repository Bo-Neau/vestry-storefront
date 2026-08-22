/**
 * Verifies the search index against the in-memory implementation.
 *
 *   npm run search:doctor
 *
 * The in-memory faceting in src/lib/facets.ts is the reference behaviour: it
 * is simple, readable and already correct. The index has to reproduce it
 * exactly, or filters mean different things depending on which path served
 * the page. This diffs the two on real queries.
 *
 * It also checks the property the whole design turns on: that size facets
 * count what is IN STOCK, not what the style is made in.
 */
import { PRODUCTS, } from "../src/data/catalogue.ts";
import { SIZE_ORDER, hasStock } from "../src/data/schema.ts";
import { facetOptions, applyFilters, EMPTY_FILTERS } from "../src/lib/facets.ts";
import { search } from "../src/lib/search/typesense.ts";
import { toDocument } from "../src/lib/search/document.ts";

const tick = (ok) => (ok ? "✓" : "✗");
let problems = 0;
const ok = (s) => console.log(`   ${tick(true)} ${s}`);
const bad = (s) => { problems += 1; console.log(`   ${tick(false)} ${s}`); };

console.log(`\nSearch doctor — ${process.env.TYPESENSE_URL}\n`);

/* 1. reachable + populated ---------------------------------------------- */
console.log("1. Index");
let live;
try {
  live = await search({ filters: EMPTY_FILTERS });
  if (live.found === PRODUCTS.length) ok(`${live.found} documents, matches source catalogue`);
  else bad(`index has ${live.found} documents, source has ${PRODUCTS.length} — reindex`);
} catch (e) {
  bad(e.message);
  console.log("\nCannot continue without a reachable index.\n");
  process.exit(1);
}

/* 2. stock-aware size facets -------------------------------------------- */
console.log("\n2. Size facets are stock-aware (the point of all this)");
const indexedSizes = live.facets.size;
let anyDifference = false;
for (const size of SIZE_ORDER) {
  const inStock = PRODUCTS.filter((p) => hasStock(p, size)).length;
  const made = PRODUCTS.filter((p) =>
    p.colorways.some((c) => c.sizes.some((s) => s.size === size)),
  ).length;
  const indexed = indexedSizes.get(size) ?? 0;

  if (indexed !== inStock) {
    bad(`${size}: index says ${indexed}, actually in stock ${inStock}`);
  } else if (indexed === made && made !== inStock) {
    bad(`${size}: index is counting sizes MADE (${made}) not sizes IN STOCK (${inStock})`);
  } else {
    if (made !== inStock) anyDifference = true;
    const note = made !== inStock ? `  (made in ${made} — correctly excluding ${made - inStock})` : "";
    ok(`${size.padEnd(3)} ${String(indexed).padStart(2)} in stock${note}`);
  }
}
if (!anyDifference) {
  bad("no size differs between made and in-stock — this test proves nothing on this data");
}

/* 3. facet counts match the in-memory reference -------------------------- */
console.log("\n3. Facet counts match src/lib/facets.ts");
const CASES = [
  { label: "no filters", filters: EMPTY_FILTERS },
  { label: "size=XXL", filters: { ...EMPTY_FILTERS, size: ["XXL"] } },
  { label: "fit=Relaxed", filters: { ...EMPTY_FILTERS, fit: ["Relaxed"] } },
  { label: "size=XS + gender=Unisex", filters: { ...EMPTY_FILTERS, size: ["XS"], gender: ["Unisex"] } },
  { label: "size=S,M (OR within group)", filters: { ...EMPTY_FILTERS, size: ["S", "M"] } },
];

for (const testCase of CASES) {
  const expectedDocs = applyFilters(PRODUCTS, testCase.filters);
  const actual = await search({ filters: testCase.filters });

  if (actual.found !== expectedDocs.length) {
    bad(`${testCase.label}: found ${actual.found}, expected ${expectedDocs.length}`);
    continue;
  }

  // Compare every facet group's counts.
  let mismatch = null;
  for (const key of ["size", "fit", "category", "gender"]) {
    const expected = facetOptions(PRODUCTS, testCase.filters, key,
      key === "size" ? SIZE_ORDER : undefined);
    for (const opt of expected) {
      const got = actual.facets[key].get(opt.value) ?? 0;
      if (got !== opt.count) {
        mismatch = `${key}."${opt.value}" index=${got} memory=${opt.count}`;
        break;
      }
    }
    if (mismatch) break;
  }

  if (mismatch) bad(`${testCase.label}: ${mismatch}`);
  else ok(`${testCase.label.padEnd(28)} ${actual.found} results, facets agree`);
}

/* 4. freshness ----------------------------------------------------------- */
console.log("\n4. Index freshness");
const docs = PRODUCTS.map((p) => toDocument(p));
const indexedAt = live.documents[0]?.indexed_at ?? 0;
const ageMin = Math.round((Date.now() - indexedAt) / 60000);
if (indexedAt === 0) bad("no indexed_at on documents");
else if (ageMin > 60) bad(`index is ${ageMin} minutes old — inventory may have moved since`);
else ok(`indexed ${ageMin} minute(s) ago`);

const liveInv = docs.reduce((t, d) => t + d.total_inventory, 0);
const idxInv = live.documents.reduce((t, d) => t + (d.total_inventory ?? 0), 0);
if (liveInv === idxInv) ok(`total inventory matches source (${liveInv} units)`);
else bad(`inventory drift: index ${idxInv} vs source ${liveInv} — reindex`);

console.log(
  problems === 0
    ? "\nIndex agrees with the in-memory reference on every case.\n"
    : `\n${problems} problem(s). Reindex with: npm run search:index\n`,
);
process.exit(problems === 0 ? 0 : 1);
