/**
 * Creates a search-only Typesense API key.
 *
 *   npm run search:keys
 *
 * The admin key can drop a collection. It must never reach a browser or a
 * config a browser can read. This mints a key scoped to `documents:search` on
 * the product collection, which is safe to expose.
 *
 * Typesense returns the key value ONCE, at creation. It is printed here and
 * not recoverable afterwards — copy it straight into .env.
 */
const URL_BASE = (process.env.TYPESENSE_URL ?? "").replace(/\/+$/, "");
const ADMIN_KEY = process.env.TYPESENSE_ADMIN_KEY ?? "";
const COLLECTION = process.env.TYPESENSE_COLLECTION ?? "products";

if (!URL_BASE || !ADMIN_KEY) {
  console.error("\nTYPESENSE_URL and TYPESENSE_ADMIN_KEY must be set in .env.\n");
  process.exit(1);
}

const res = await fetch(`${URL_BASE}/keys`, {
  method: "POST",
  headers: { "X-TYPESENSE-API-KEY": ADMIN_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    description: `search-only for ${COLLECTION}`,
    actions: ["documents:search"],
    collections: [COLLECTION, `${COLLECTION}_*`],
  }),
});

if (!res.ok) {
  console.error(`\nFailed: HTTP ${res.status} — ${await res.text()}\n`);
  process.exit(1);
}

const key = await res.json();
console.log(`\nSearch-only key created (id ${key.id}).`);
console.log(`Scoped to: ${key.collections.join(", ")}`);
console.log(`Actions:   ${key.actions.join(", ")}\n`);
console.log(`Add to .env — this value is shown only once:\n`);
console.log(`TYPESENSE_SEARCH_KEY=${key.value}\n`);
