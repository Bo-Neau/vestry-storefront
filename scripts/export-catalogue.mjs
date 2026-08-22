/**
 * Generates the client-facing intake sheets from the working catalogue.
 *
 * Running this against real data proves the metafield spec is implementable
 * rather than aspirational, and gives the client a filled example next to
 * the blank template — "here is what done looks like".
 *
 *   npm run export:sheets
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { PRODUCTS } from "../src/data/catalogue.ts";
import { SIZE_ORDER } from "../src/data/schema.ts";

const CATEGORY = {
  "T-shirts": "Apparel & Accessories > Clothing > Clothing Tops > T-Shirts",
  "Shirts":   "Apparel & Accessories > Clothing > Clothing Tops > Shirts",
  "Knitwear": "Apparel & Accessories > Clothing > Clothing Tops > Sweaters",
  "Trousers": "Apparel & Accessories > Clothing > Pants",
};

const CHART_HANDLE = {
  "chart-tops": "tops-garment",
  "chart-knitwear": "knitwear-garment",
  "chart-trousers": "trousers-garment",
};

/** RFC 4180: quote if the field contains a comma, quote or newline. */
const cell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) => rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";

/* ---------------- styles sheet ---------------- */

const STYLE_COLUMNS = [
  "handle",
  "title",
  "product_category",
  "price",
  "compare_at_price",
  "spec.summary",
  "spec.fit_cut",
  "category:neckline",
  "category:sleeve_length_type",
  "category:fabric",
  "category:target_gender",
  "category:clothing_features",
  "spec.fabric_weight_gsm",
  "fit.model_height",
  "fit.model_size_worn",
  "fit.runs_true_to_size",
  "spec.size_chart",
  "spec.care_instructions",
  "spec.details",
  "description",
];

const styleRows = [STYLE_COLUMNS];
for (const p of PRODUCTS) {
  styleRows.push([
    p.handle,
    p.title,
    CATEGORY[p.category] ?? "",
    (p.price.amount / 100).toFixed(2),
    p.compareAtPrice ? (p.compareAtPrice.amount / 100).toFixed(2) : "",
    p.summary,
    p.attributes.fit,
    p.attributes.neckline ?? "",
    p.attributes.sleeveLength ?? "",
    p.attributes.fabric,
    p.attributes.targetGender,
    p.attributes.features.join(" | "),
    p.attributes.fabricWeightGsm,
    // dimension type: value + unit. Written here as the admin displays it.
    `${p.fit.modelHeightCm} cm`,
    p.fit.modelSizeWorn,
    p.fit.runsTrueToSize,
    CHART_HANDLE[p.sizeChartId] ?? p.sizeChartId,
    p.care.join(" | "),
    p.details.join(" | "),
    p.description,
  ]);
}

/* ---------------- variants sheet ---------------- */

const VARIANT_COLUMNS = [
  "handle",
  "option1_colour",
  "colour_hex",
  "option2_size",
  "sku",
  "inventory_quantity",
];

const variantRows = [VARIANT_COLUMNS];
let styleNo = 0;
for (const p of PRODUCTS) {
  styleNo += 1;
  let colourNo = 0;
  for (const c of p.colorways) {
    colourNo += 1;
    for (const size of SIZE_ORDER) {
      const row = c.sizes.find((s) => s.size === size);
      // Every size gets a row, including zero — a missing row and a zero row
      // mean different things, and the filter depends on knowing which.
      variantRows.push([
        p.handle,
        c.name,
        c.hex,
        size,
        `${String(styleNo).padStart(3, "0")}-${String(colourNo).padStart(2, "0")}-${size}`,
        row ? row.inventory : 0,
      ]);
    }
  }
}

/* ---------------- blank template ---------------- */

const blankRows = [
  STYLE_COLUMNS,
  [
    "example-crew-neck",
    "Example Crew Neck",
    CATEGORY["T-shirts"],
    "38.00",
    "",
    "One line: what it is and its most distinctive property.",
    "Regular",
    "Crew",
    "Short",
    "100% organic cotton",
    "Unisex",
    "Pre-shrunk | Self-fabric neck rib",
    "180",
    "185 cm",
    "L",
    "true",
    "tops-garment",
    "Machine wash cold | Tumble dry low",
    "Made in Portugal",
    "Longer description. Fabric, construction, and how it wears.",
  ],
];

mkdirSync("docs", { recursive: true });
writeFileSync("docs/styles.csv", toCsv(styleRows));
writeFileSync("docs/variants.csv", toCsv(variantRows));
writeFileSync("docs/styles-TEMPLATE.csv", toCsv(blankRows));

console.log(`styles.csv          ${styleRows.length - 1} styles`);
console.log(`variants.csv        ${variantRows.length - 1} variant rows`);
console.log(`styles-TEMPLATE.csv blank sheet with one worked example row`);
console.log(`\nRequired-field completeness across ${PRODUCTS.length} styles:`);
const required = ["fit.model_height", "fit.model_size_worn", "fit.runs_true_to_size", "spec.size_chart", "spec.fabric_weight_gsm"];
for (const f of required) {
  const i = STYLE_COLUMNS.indexOf(f);
  const filled = styleRows.slice(1).filter((r) => String(r[i]).trim() !== "").length;
  console.log(`  ${f.padEnd(26)} ${filled}/${PRODUCTS.length}`);
}
