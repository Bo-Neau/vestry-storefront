/**
 * Seeds a dev store with the sample catalogue so there is something to query.
 *
 *   npm run shopify:seed          # create
 *   npm run shopify:seed -- --dry # print what it would do, change nothing
 *
 * NOT VERIFIED AGAINST A LIVE STORE — written from the Admin API reference,
 * not run against a real dev store, because that needs credentials only you
 * have. Every mutation reports its userErrors, so failures say what broke.
 *
 * If this fights you, the more reliable route is Shopify's own CSV importer
 * with docs/styles.csv and docs/variants.csv, then run shopify:setup and fill
 * metafields in admin. That path is well-trodden; this script is convenience.
 */
import { admin, requireAdmin, userErrors, tick } from "./lib/admin.mjs";
import { PRODUCTS } from "../src/data/catalogue.ts";
import { SIZE_CHARTS } from "../src/data/size-charts.ts";
import { SIZE_ORDER } from "../src/data/schema.ts";

const DRY = process.argv.includes("--dry");
// A dry run touches nothing, so it must not demand credentials — it is how
// you inspect the plan before a store exists.
if (!DRY) requireAdmin();

const CATEGORY_SEARCH = {
  "T-shirts": "T-Shirts",
  "Shirts": "Shirts",
  "Knitwear": "Sweaters",
  "Trousers": "Pants",
};

const say = (s) => console.log(s);
const step = (ok, label, extra = "") =>
  console.log(`  ${tick(ok)} ${label}${extra ? ` — ${extra}` : ""}`);

/* ---------------- location (needed for inventory) ---------------- */

let locationId = null;
if (!DRY) {
  const loc = await admin(`{ locations(first: 1) { nodes { id name } } }`);
  locationId = loc.locations.nodes[0]?.id ?? null;
  if (!locationId) {
    console.error("No location found. A store needs a location to hold inventory.");
    process.exit(1);
  }
  say(`Location: ${loc.locations.nodes[0].name}`);
}

/* ---------------- taxonomy category lookup ---------------- */

const categoryGid = new Map();
if (!DRY) {
  say("\nResolving taxonomy categories");
  for (const [ours, search] of Object.entries(CATEGORY_SEARCH)) {
    try {
      const d = await admin(
        `query($q: String!) { taxonomy { categories(first: 5, search: $q) {
           nodes { id fullName } } } }`,
        { q: search },
      );
      const hit = d.taxonomy.categories.nodes.find((n) =>
        n.fullName.startsWith("Apparel & Accessories"),
      ) ?? d.taxonomy.categories.nodes[0];
      if (hit) {
        categoryGid.set(ours, hit.id);
        step(true, ours.padEnd(10), hit.fullName);
      } else {
        step(false, ours.padEnd(10), "no match — set the category by hand in admin");
      }
    } catch (e) {
      step(false, ours.padEnd(10), e.message);
    }
  }
}

/* ---------------- size chart metaobjects ---------------- */

const MO_CREATE = `
  mutation($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle type }
      userErrors { field message code }
    }
  }
`;

const dim = (cm) => JSON.stringify({ value: cm, unit: "centimeters" });

const chartGid = new Map();
say("\nSize charts");
for (const chart of SIZE_CHARTS) {
  if (DRY) {
    step(true, chart.id, `${chart.rows.length} rows, ${chart.howToMeasure.length} instructions (dry run)`);
    continue;
  }
  try {
    // Rows first, then instructions, then the chart that references both.
    const rowIds = [];
    for (const r of chart.rows) {
      const fields = [
        { key: "size", value: r.size },
        { key: "waist_cm", value: dim(r.waistCm) },
        { key: "length_cm", value: dim(r.lengthCm) },
      ];
      if (r.chestCm > 0) fields.push({ key: "chest_cm", value: dim(r.chestCm) });
      const d = await admin(MO_CREATE, {
        metaobject: { type: "size_chart_row", fields },
      });
      const err = userErrors(d.metaobjectCreate);
      if (err) throw new Error(`row ${r.size}: ${err}`);
      rowIds.push(d.metaobjectCreate.metaobject.id);
    }

    const howIds = [];
    for (const h of chart.howToMeasure) {
      const d = await admin(MO_CREATE, {
        metaobject: {
          type: "measure_instruction",
          fields: [
            { key: "part", value: h.part },
            { key: "instruction", value: h.instruction },
          ],
        },
      });
      const err = userErrors(d.metaobjectCreate);
      if (err) throw new Error(`instruction ${h.part}: ${err}`);
      howIds.push(d.metaobjectCreate.metaobject.id);
    }

    const d = await admin(MO_CREATE, {
      metaobject: {
        type: "size_chart",
        fields: [
          { key: "name", value: chart.name },
          { key: "measurement_basis", value: "Garment" },
          { key: "rows", value: JSON.stringify(rowIds) },
          { key: "how_to_measure", value: JSON.stringify(howIds) },
        ],
      },
    });
    const err = userErrors(d.metaobjectCreate);
    if (err) throw new Error(err);
    chartGid.set(chart.id, d.metaobjectCreate.metaobject.id);
    step(true, chart.id, `${rowIds.length} rows`);
  } catch (e) {
    step(false, chart.id, e.message);
  }
}

/* ---------------- products ---------------- */

const PRODUCT_CREATE = `
  mutation($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product { id handle options { id name optionValues { id name } } variants(first:1){nodes{id}} }
      userErrors { field message code }
    }
  }
`;

const VARIANTS_CREATE = `
  mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(
      productId: $productId, variants: $variants,
      strategy: REMOVE_STANDALONE_VARIANT
    ) {
      productVariants { id sku }
      userErrors { field message code }
    }
  }
`;

const METAFIELDS_SET = `
  mutation($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { namespace key }
      userErrors { field message code }
    }
  }
`;

say("\nProducts");
let ok = 0, bad = 0;

for (const p of PRODUCTS) {
  const colours = p.colorways.map((c) => c.name);
  const sizes = SIZE_ORDER.filter((s) =>
    p.colorways.some((c) => (c.sizes.find((x) => x.size === s)?.inventory ?? 0) >= 0),
  );

  if (DRY) {
    step(true, p.handle.padEnd(24),
      `${colours.length} colours x ${sizes.length} sizes = ${colours.length * sizes.length} variants`);
    continue;
  }

  try {
    const productInput = {
      title: p.title,
      handle: p.handle,
      descriptionHtml: `<p>${p.description}</p>`,
      productType: p.category,
      status: "ACTIVE",
      productOptions: [
        { name: "Colour", values: colours.map((name) => ({ name })) },
        { name: "Size", values: sizes.map((name) => ({ name })) },
      ],
    };
    const gid = categoryGid.get(p.category);
    if (gid) productInput.category = gid;

    const created = await admin(PRODUCT_CREATE, { product: productInput });
    let err = userErrors(created.productCreate);
    if (err) throw new Error(err);

    const productId = created.productCreate.product.id;

    // Variants: every colourway x size, with real inventory including zeroes.
    const variants = [];
    for (const c of p.colorways) {
      for (const size of sizes) {
        const inv = c.sizes.find((s) => s.size === size)?.inventory ?? 0;
        variants.push({
          optionValues: [
            { optionName: "Colour", name: c.name },
            { optionName: "Size", name: size },
          ],
          price: (p.price.amount / 100).toFixed(2),
          ...(p.compareAtPrice
            ? { compareAtPrice: (p.compareAtPrice.amount / 100).toFixed(2) }
            : {}),
          inventoryItem: { sku: `${p.handle}-${c.id}-${size}`, tracked: true },
          inventoryQuantities: [{ locationId, availableQuantity: inv }],
        });
      }
    }

    const vres = await admin(VARIANTS_CREATE, { productId, variants });
    err = userErrors(vres.productVariantsBulkCreate);
    if (err) throw new Error(`variants: ${err}`);

    // Metafields
    const mf = [
      { namespace: "fit", key: "model_height", type: "dimension",
        value: dim(p.fit.modelHeightCm) },
      { namespace: "fit", key: "model_size_worn", type: "single_line_text_field",
        value: p.fit.modelSizeWorn },
      { namespace: "fit", key: "runs_true_to_size", type: "single_line_text_field",
        value: p.fit.runsTrueToSize },
      { namespace: "spec", key: "summary", type: "single_line_text_field",
        value: p.summary.slice(0, 120) },
      { namespace: "spec", key: "fit_cut", type: "single_line_text_field",
        value: p.attributes.fit },
      { namespace: "spec", key: "fabric_weight_gsm", type: "number_integer",
        value: String(p.attributes.fabricWeightGsm) },
      { namespace: "spec", key: "care_instructions", type: "list.single_line_text_field",
        value: JSON.stringify(p.care) },
      { namespace: "spec", key: "details", type: "list.single_line_text_field",
        value: JSON.stringify([...p.details, ...p.attributes.features]) },
      { namespace: "spec", key: "style_code", type: "single_line_text_field",
        value: p.id },
    ];
    const chart = chartGid.get(p.sizeChartId);
    if (chart) {
      mf.push({ namespace: "spec", key: "size_chart",
        type: "metaobject_reference", value: chart });
    }

    const mres = await admin(METAFIELDS_SET, {
      metafields: mf.map((m) => ({ ...m, ownerId: productId })),
    });
    err = userErrors(mres.metafieldsSet);
    if (err) throw new Error(`metafields: ${err}`);

    step(true, p.handle.padEnd(24), `${variants.length} variants, ${mf.length} metafields`);
    ok += 1;
  } catch (e) {
    step(false, p.handle.padEnd(24), e.message);
    bad += 1;
  }
}

if (DRY) {
  say("\nDry run — nothing was created.\n");
  process.exit(0);
}

say(`\n${ok} products created, ${bad} failed`);
say("\nNot set by this script (they need real work, not sample data):");
say("  - Product images. Replace Garment.astro with real photography.");
say("  - Category metafields (neckline, fabric, target gender, features).");
say("    Set the product category in admin, then fill them — they come from");
say("    Shopify's taxonomy and are picked from lists, not free text.");
say("  - Reviews. Those live in a reviews platform, not in Shopify.");
say("\nNext: npm run shopify:doctor\n");
process.exit(bad === 0 ? 0 : 1);
