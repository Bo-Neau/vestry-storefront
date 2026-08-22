/**
 * Builds or rebuilds the Typesense product index.
 *
 *   npm run search:index          # reindex from the configured data source
 *   npm run search:index -- --recreate
 *
 * Uses an ALIAS so reindexing is atomic: documents go into a fresh timestamped
 * collection, and the alias flips only once every document has landed. A
 * failed reindex therefore leaves the live index untouched rather than
 * half-empty — which for a stock-aware size filter means the difference
 * between "slightly stale" and "lying to shoppers".
 */
import { toDocument, COLLECTION_SCHEMA } from "../src/lib/search/document.ts";
import { PRODUCTS } from "../src/data/catalogue.ts";

const URL_BASE = (process.env.TYPESENSE_URL ?? "").replace(/\/+$/, "");
const ADMIN_KEY = process.env.TYPESENSE_ADMIN_KEY ?? "";
const ALIAS = process.env.TYPESENSE_COLLECTION ?? "products";
const RECREATE = process.argv.includes("--recreate");

if (!URL_BASE || !ADMIN_KEY) {
  console.error("\nTYPESENSE_URL and TYPESENSE_ADMIN_KEY must be set in .env.");
  console.error("See docs/search-setup.md.\n");
  process.exit(1);
}

const tick = (ok) => (ok ? "✓" : "✗");

async function ts(path, options = {}) {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...options,
    headers: {
      "X-TYPESENSE-API-KEY": ADMIN_KEY,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${path}: ${text}`);
    err.status = res.status;
    throw err;
  }
  try { return JSON.parse(text); } catch { return text; }
}

console.log(`\nIndexing to ${URL_BASE} (alias "${ALIAS}")\n`);

/* 1. health -------------------------------------------------------------- */
try {
  const h = await fetch(`${URL_BASE}/health`).then((r) => r.json());
  console.log(`  ${tick(h.ok)} server healthy`);
} catch (e) {
  console.error(`  ${tick(false)} cannot reach ${URL_BASE} — ${e.message}\n`);
  process.exit(1);
}

/* 2. build documents ----------------------------------------------------- */
const now = Date.now();
const documents = PRODUCTS.map((p) => toDocument(p, now));
console.log(`  ${tick(true)} built ${documents.length} documents`);

// Guard the thing that matters: sizes_in_stock must not equal sizes_made for
// every product, or the honest filter has silently become the dishonest one.
const identical = documents.filter(
  (d) => d.sizes_in_stock.length === d.sizes_made.length,
).length;
if (identical === documents.length && documents.length > 1) {
  console.log(
    `  ${tick(false)} WARNING: every product has sizes_in_stock === sizes_made.\n` +
    `     Either nothing is sold out, or inventory is not reaching the index.`,
  );
} else {
  console.log(
    `  ${tick(true)} stock-aware: ${documents.length - identical}/${documents.length} ` +
    `products have sizes sold out`,
  );
}

/* 3. create a fresh collection ------------------------------------------- */
const target = `${ALIAS}_${now}`;
await ts("/collections", {
  method: "POST",
  body: JSON.stringify({ ...COLLECTION_SCHEMA, name: target }),
});
console.log(`  ${tick(true)} created collection ${target}`);

/* 4. import -------------------------------------------------------------- */
const ndjson = documents.map((d) => JSON.stringify(d)).join("\n");
const importResult = await ts(
  `/collections/${target}/documents/import?action=upsert`,
  { method: "POST", body: ndjson, headers: { "Content-Type": "text/plain" } },
);

const lines = String(importResult).trim().split("\n").filter(Boolean);
const failures = lines
  .map((l) => { try { return JSON.parse(l); } catch { return { success: false }; } })
  .filter((r) => r.success === false);

if (failures.length) {
  console.log(`  ${tick(false)} ${failures.length} document(s) failed to import`);
  for (const f of failures.slice(0, 3)) console.log(`     ${f.error ?? JSON.stringify(f)}`);
  console.log(`\n  Alias NOT moved. The live index is unchanged.\n`);
  process.exit(1);
}
console.log(`  ${tick(true)} imported ${lines.length} documents`);

/* 5. flip the alias ------------------------------------------------------ */
let previous = null;
try {
  const existing = await ts(`/aliases/${ALIAS}`);
  previous = existing.collection_name;
} catch (e) {
  if (e.status !== 404) throw e;
}

await ts(`/aliases/${ALIAS}`, {
  method: "PUT",
  body: JSON.stringify({ collection_name: target }),
});
console.log(`  ${tick(true)} alias "${ALIAS}" -> ${target}`);

/* 6. drop the old collection --------------------------------------------- */
if (previous && previous !== target) {
  if (RECREATE) {
    await ts(`/collections/${previous}`, { method: "DELETE" });
    console.log(`  ${tick(true)} removed previous collection ${previous}`);
  } else {
    console.log(`  · previous collection ${previous} kept (pass --recreate to drop)`);
  }
}

console.log(`\nIndexed ${documents.length} styles.\n`);
