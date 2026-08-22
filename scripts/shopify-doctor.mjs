/**
 * Diagnoses a Shopify dev store connection and resolves the one thing this
 * project cannot know in advance: the real namespace/key strings Shopify uses
 * for category metafields.
 *
 *   npm run shopify:doctor
 *
 * Reports what is wired up, what is missing, and exactly what to change.
 */
import { admin, storefrontProbe, config, tick } from "./lib/admin.mjs";
import { CUSTOM, CATEGORY, idKey } from "../src/data/shopify/identifiers.ts";

const c = config();
let problems = 0;
const note = (s) => console.log(`   ${s}`);
const fail = (s) => { problems += 1; console.log(`   ${s}`); };

console.log(`\nShopify doctor — ${c.domain || "(no domain set)"} @ ${c.apiVersion}\n`);

/* 1. Storefront token ---------------------------------------------------- */
console.log("1. Storefront API");
const shop = await storefrontProbe(`{ shop { name primaryDomain { url } } }`);
if (shop.ok) {
  note(`${tick(true)} connected — "${shop.data.shop.name}"`);
} else {
  fail(`${tick(false)} ${shop.reason}`);
  note("  Needs a PUBLIC Storefront API token and the");
  note("  unauthenticated_read_product_listings scope.");
}

/* 2. Admin token --------------------------------------------------------- */
console.log("\n2. Admin API");
let adminOk = false;
try {
  const d = await admin(`{ shop { name } }`);
  note(`${tick(true)} connected — "${d.shop.name}"`);
  adminOk = true;
} catch (e) {
  fail(`${tick(false)} ${e.message}`);
}

/* 3. Our custom metafield definitions ------------------------------------ */
if (adminOk) {
  console.log("\n3. Custom metafield definitions (fit.* and spec.*)");
  const data = await admin(`
    query { metafieldDefinitions(first: 250, ownerType: PRODUCT) {
      nodes { namespace key type { name } access { storefront } }
    } }
  `);
  const found = new Map(
    data.metafieldDefinitions.nodes.map((d) => [`${d.namespace}.${d.key}`, d]),
  );

  for (const id of Object.values(CUSTOM)) {
    const key = idKey(id);
    const def = found.get(key);
    if (!def) {
      fail(`${tick(false)} ${key} missing — run: npm run shopify:setup`);
      continue;
    }
    // A definition the Storefront API cannot read is invisible to the app.
    const readable = def.access?.storefront === "PUBLIC_READ";
    if (readable) {
      note(`${tick(true)} ${key.padEnd(26)} ${def.type.name}`);
    } else {
      fail(`${tick(false)} ${key.padEnd(26)} exists but storefront access is ` +
           `${def.access?.storefront ?? "unset"} — must be PUBLIC_READ or the ` +
           `storefront cannot read it`);
    }
  }

  /* 4. Category metafields — discover the REAL identifiers --------------- */
  console.log("\n4. Category metafields (Shopify's own — verifying our guesses)");
  const taxonomyDefs = data.metafieldDefinitions.nodes.filter(
    (d) => d.namespace !== "fit" && d.namespace !== "spec" && d.namespace !== "custom",
  );

  if (taxonomyDefs.length === 0) {
    fail(`${tick(false)} none found. Assign a product category to a product ` +
         `first — category metafields only appear once a category is set.`);
  } else {
    const actual = new Set(taxonomyDefs.map((d) => `${d.namespace}.${d.key}`));
    for (const [name, id] of Object.entries(CATEGORY)) {
      const key = idKey(id);
      if (actual.has(key)) {
        note(`${tick(true)} ${name.padEnd(14)} ${key}`);
      } else {
        fail(`${tick(false)} ${name.padEnd(14)} ${key} NOT FOUND`);
      }
    }
    console.log("\n   Actual taxonomy definitions on this store:");
    for (const d of taxonomyDefs.slice(0, 40)) {
      console.log(`     ${d.namespace}.${d.key}`);
    }
    console.log("\n   If any guess above is wrong, correct");
    console.log("   src/data/shopify/identifiers.ts to match this list.");
    console.log("   A wrong key yields null silently — missing filters, not a crash.");
  }

  /* 5. Metaobject definitions ------------------------------------------- */
  console.log("\n5. Metaobject definitions");
  const mo = await admin(`
    query { metaobjectDefinitions(first: 100) { nodes { type name } } }
  `);
  const types = new Set(mo.metaobjectDefinitions.nodes.map((n) => n.type));
  for (const t of ["size_chart", "size_chart_row", "measure_instruction"]) {
    if (types.has(t)) note(`${tick(true)} ${t}`);
    else fail(`${tick(false)} ${t} missing — run: npm run shopify:setup`);
  }
}

/* 6. Inventory scope ----------------------------------------------------- */
console.log("\n6. Inventory visibility (stock-aware size filters depend on this)");
const inv = await storefrontProbe(`
  { products(first: 1) { nodes { handle variants(first: 1) {
      nodes { quantityAvailable availableForSale } } } } }
`);
if (!inv.ok) {
  fail(`${tick(false)} ${inv.reason}`);
} else {
  const node = inv.data.products.nodes[0];
  if (!node) {
    fail(`${tick(false)} no products in the store yet — run: npm run shopify:seed`);
  } else {
    const v = node.variants.nodes[0];
    if (v && v.quantityAvailable !== null) {
      note(`${tick(true)} quantityAvailable readable (${v.quantityAvailable} on "${node.handle}")`);
    } else {
      fail(`${tick(false)} quantityAvailable is null. Grant the app the`);
      note("  unauthenticated_read_product_inventory scope, or the storefront");
      note("  falls back to in-stock/sold-out only and loses low-stock states.");
    }
  }
}

/* summary --------------------------------------------------------------- */
console.log(
  problems === 0
    ? "\nAll checks passed.\n"
    : `\n${problems} problem${problems === 1 ? "" : "s"} above. Fix, then re-run.\n`,
);
process.exit(problems === 0 ? 0 : 1);
