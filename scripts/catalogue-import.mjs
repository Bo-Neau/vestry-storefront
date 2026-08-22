/**
 * Rebuilds src/data/catalogue.ts from the CSV sheets.
 *
 *   npm run catalogue:import          # validate and write
 *   npm run catalogue:import -- --check   # validate only, change nothing
 *
 * Lets a non-technical person maintain products in a spreadsheet: edit
 * docs/styles.csv and docs/variants.csv, run one command, push.
 *
 * Validation is the point. The sheets are filled in by hand, so every field
 * is checked and every problem is reported with a line number and what was
 * expected — a bad value must fail here with a readable message, not surface
 * later as a filter that silently matches nothing.
 *
 * Reviews are NOT in the CSVs (they come from a reviews platform in
 * production), so existing reviews are preserved by handle rather than wiped.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseCsvRecords } from "./lib/csv.mjs";
import { PRODUCTS } from "../src/data/catalogue.ts";
import { SIZE_ORDER } from "../src/data/schema.ts";
import { SIZE_CHARTS } from "../src/data/size-charts.ts";

const CHECK_ONLY = process.argv.includes("--check");

const CATEGORY_FROM_TAXONOMY = {
  "T-Shirts": "T-shirts", "Shirts": "Shirts",
  "Sweaters": "Knitwear", "Pants": "Trousers",
};
const SHAPE = { "T-shirts": "tee", "Shirts": "shirt", "Knitwear": "knit", "Trousers": "trouser" };
const CHART_ID = { "tops-garment": "chart-tops", "knitwear-garment": "chart-knitwear", "trousers-garment": "chart-trousers" };

const FITS = ["Slim", "Regular", "Relaxed", "Oversized"];
const NECKLINES = ["Crew", "V-neck", "Henley", "Polo", "Collared"];
const SLEEVES = ["Short", "Long", "Sleeveless"];
const GENDERS = ["Men", "Women", "Unisex"];
const RUNS = ["small", "true", "large"];

const errors = [];
const warnings = [];
const fail = (sheet, line, field, message) =>
  errors.push(`${sheet}:${line}  ${field.padEnd(24)} ${message}`);

/* ---------- helpers ---------- */

const oneOf = (sheet, line, field, value, allowed, required = true) => {
  if (!value) {
    if (required) fail(sheet, line, field, `is required — one of: ${allowed.join(", ")}`);
    return undefined;
  }
  const hit = allowed.find((a) => a.toLowerCase() === value.toLowerCase());
  if (!hit) fail(sheet, line, field, `"${value}" is not allowed — use one of: ${allowed.join(", ")}`);
  return hit;
};

const number = (sheet, line, field, value, { min, max, required = true } = {}) => {
  if (!value) {
    if (required) fail(sheet, line, field, "is required");
    return undefined;
  }
  const n = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  if (!Number.isFinite(n)) { fail(sheet, line, field, `"${value}" is not a number`); return undefined; }
  if (min !== undefined && n < min) fail(sheet, line, field, `${n} is below the minimum of ${min}`);
  if (max !== undefined && n > max) fail(sheet, line, field, `${n} is above the maximum of ${max}`);
  return n;
};

const pipeList = (value) =>
  value ? value.split("|").map((v) => v.trim()).filter(Boolean) : [];

const q = (s) => JSON.stringify(s ?? "");

/* ---------- read ---------- */

for (const f of ["docs/styles.csv", "docs/variants.csv"]) {
  if (!existsSync(f)) {
    console.error(`\nMissing ${f}. Run \`npm run export:sheets\` to generate a starting point.\n`);
    process.exit(1);
  }
}

const styles = parseCsvRecords(readFileSync("docs/styles.csv", "utf8")).records;
const variants = parseCsvRecords(readFileSync("docs/variants.csv", "utf8")).records;

console.log(`\nReading ${styles.length} styles and ${variants.length} variant rows\n`);

/* ---------- validate styles ---------- */

const seenHandles = new Set();
const parsed = [];

for (const row of styles) {
  const line = row.__line;
  const handle = row.handle;

  if (!handle) { fail("styles", line, "handle", "is required"); continue; }
  if (!/^[a-z0-9-]+$/.test(handle)) {
    fail("styles", line, "handle", `"${handle}" must be lowercase letters, numbers and hyphens only`);
  }
  if (seenHandles.has(handle)) {
    fail("styles", line, "handle", `"${handle}" is used more than once — handles must be unique`);
  }
  seenHandles.add(handle);

  if (!row.title) fail("styles", line, "title", "is required");

  const taxonomyLeaf = (row.product_category || "").split(">").pop()?.trim() ?? "";
  const category = CATEGORY_FROM_TAXONOMY[taxonomyLeaf];
  if (!category) {
    fail("styles", line, "product_category",
      `"${row.product_category}" not recognised — must end in one of: ${Object.keys(CATEGORY_FROM_TAXONOMY).join(", ")}`);
  }

  const price = number("styles", line, "price", row.price, { min: 0.01 });
  const compareAt = row.compare_at_price
    ? number("styles", line, "compare_at_price", row.compare_at_price, { min: 0.01 })
    : undefined;
  if (compareAt !== undefined && price !== undefined && compareAt <= price) {
    warnings.push(`styles:${line}  compare_at_price (${compareAt}) is not above price (${price}) — no discount will show`);
  }

  const summary = row["spec.summary"];
  if (!summary) fail("styles", line, "spec.summary", "is required — one line for cards and search");
  else if (summary.length > 120) {
    warnings.push(`styles:${line}  spec.summary is ${summary.length} chars; it will be cramped on cards over ~120`);
  }

  const fit = oneOf("styles", line, "spec.fit_cut", row["spec.fit_cut"], FITS);
  const neckline = oneOf("styles", line, "category:neckline", row["category:neckline"], NECKLINES, false);
  const sleeve = oneOf("styles", line, "category:sleeve_length_type", row["category:sleeve_length_type"], SLEEVES, false);
  const gender = oneOf("styles", line, "category:target_gender", row["category:target_gender"], GENDERS);
  const runs = oneOf("styles", line, "fit.runs_true_to_size", row["fit.runs_true_to_size"], RUNS);
  const modelSize = oneOf("styles", line, "fit.model_size_worn", row["fit.model_size_worn"], [...SIZE_ORDER]);

  if (!row["category:fabric"]) fail("styles", line, "category:fabric", "is required");
  const gsm = number("styles", line, "spec.fabric_weight_gsm", row["spec.fabric_weight_gsm"], { min: 40, max: 900 });
  const height = number("styles", line, "fit.model_height", row["fit.model_height"], { min: 120, max: 230 });

  const chartKey = row["spec.size_chart"];
  const sizeChartId = CHART_ID[chartKey] ?? (SIZE_CHARTS.find((c) => c.id === chartKey)?.id);
  if (!sizeChartId) {
    fail("styles", line, "spec.size_chart",
      `"${chartKey}" unknown — use one of: ${Object.keys(CHART_ID).join(", ")}`);
  }

  parsed.push({
    line, handle, title: row.title, category, shape: category ? SHAPE[category] : "tee",
    price, compareAt, summary, description: row.description || summary,
    fit, neckline, sleeve, fabric: row["category:fabric"], gsm, gender,
    features: pipeList(row["category:clothing_features"]),
    height, modelSize, runs, sizeChartId,
    care: pipeList(row["spec.care_instructions"]),
    details: pipeList(row["spec.details"]),
    colorways: new Map(),
  });
}

/* ---------- validate variants ---------- */

const byHandle = new Map(parsed.map((p) => [p.handle, p]));
const seenVariant = new Set();

for (const row of variants) {
  const line = row.__line;
  const product = byHandle.get(row.handle);
  if (!product) {
    fail("variants", line, "handle", `"${row.handle}" has no matching row in styles.csv`);
    continue;
  }

  const colour = row.option1_colour;
  if (!colour) { fail("variants", line, "option1_colour", "is required"); continue; }

  const size = oneOf("variants", line, "option2_size", row.option2_size, [...SIZE_ORDER]);
  if (!size) continue;

  const key = `${row.handle}|${colour}|${size}`;
  if (seenVariant.has(key)) {
    fail("variants", line, "option2_size", `${colour}/${size} appears twice for ${row.handle}`);
    continue;
  }
  seenVariant.add(key);

  const hex = row.colour_hex;
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    fail("variants", line, "colour_hex", `"${hex}" must be a 6-digit hex colour like #1E1E1C`);
  }

  const qty = number("variants", line, "inventory_quantity", row.inventory_quantity, { min: 0 });
  if (qty !== undefined && !Number.isInteger(qty)) {
    fail("variants", line, "inventory_quantity", `${qty} must be a whole number`);
  }

  const cw = product.colorways.get(colour) ?? { name: colour, hex, sizes: new Map() };
  cw.hex = hex;
  cw.sizes.set(size, qty ?? 0);
  product.colorways.set(colour, cw);
}

/* ---------- cross checks ---------- */

for (const p of parsed) {
  if (p.colorways.size === 0) {
    fail("styles", p.line, "handle", `"${p.handle}" has no variant rows in variants.csv`);
    continue;
  }
  for (const [name, cw] of p.colorways) {
    const missing = SIZE_ORDER.filter((s) => !cw.sizes.has(s));
    if (missing.length) {
      warnings.push(
        `variants  ${p.handle} / ${name} has no row for ${missing.join(", ")} — treated as sold out. ` +
        `A missing row and a 0 mean different things; add explicit zeroes.`,
      );
    }
  }
  const anyStock = [...p.colorways.values()].some((cw) => [...cw.sizes.values()].some((n) => n > 0));
  if (!anyStock) warnings.push(`variants  ${p.handle} has zero stock in every size — it will show as sold out`);
}

/* ---------- report ---------- */

if (warnings.length) {
  console.log("Warnings\n");
  for (const w of warnings) console.log(`  ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`${errors.length} error${errors.length === 1 ? "" : "s"} — nothing written\n`);
  for (const e of errors) console.log(`  ${e}`);
  console.log("\nFix the rows above and run again.\n");
  process.exit(1);
}

if (CHECK_ONLY) {
  console.log(`Valid. ${parsed.length} styles, ${seenVariant.size} variants. Nothing written (--check).\n`);
  process.exit(0);
}

/* ---------- generate ---------- */

// Reviews live in a reviews platform, not the sheets. Carry the existing ones
// across so an import does not silently empty the product pages.
const reviewsByHandle = new Map(PRODUCTS.map((p) => [p.handle, p.reviews]));
let carried = 0;

const styleId = (p, i) =>
  `STYLE-${p.category.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4)}-${String(i + 1).padStart(3, "0")}`;

const body = parsed.map((p, i) => {
  const reviews = reviewsByHandle.get(p.handle) ?? [];
  if (reviews.length) carried += reviews.length;

  const colourLines = [...p.colorways.values()].map((cw) => {
    const stockArgs = SIZE_ORDER.map((s) => cw.sizes.get(s) ?? 0).join(", ");
    const id = `${p.handle}-${cw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return `      { id: ${q(id)}, name: ${q(cw.name)}, hex: ${q(cw.hex)}, sizes: stock(${stockArgs}) },`;
  }).join("\n");

  const reviewLines = reviews.map((r) =>
    `      rev(${r.rating}, ${q(r.title)}, ${q(r.body)}, ${q(r.author)}, ${q(r.date)}, ${q(r.heightBand)}, ${q(r.sizePurchased)}, ${q(r.fitFeedback)}),`
  ).join("\n");

  return `  {
    id: ${q(styleId(p, i))},
    handle: ${q(p.handle)},
    title: ${q(p.title)},
    category: ${q(p.category)},
    shape: ${q(p.shape)},
    price: usd(${p.price}),${p.compareAt ? `\n    compareAtPrice: usd(${p.compareAt}),` : ""}
    summary: ${q(p.summary)},
    description: ${q(p.description)},
    attributes: {
      fit: ${q(p.fit)},${p.neckline ? `\n      neckline: ${q(p.neckline)},` : ""}${p.sleeve ? `\n      sleeveLength: ${q(p.sleeve)},` : ""}
      fabric: ${q(p.fabric)},
      fabricWeightGsm: ${p.gsm},
      targetGender: ${q(p.gender)},
      features: [${p.features.map(q).join(", ")}],
    },
    fit: { modelHeightCm: ${p.height}, modelSizeWorn: ${q(p.modelSize)}, runsTrueToSize: ${q(p.runs)} },
    sizeChartId: ${q(p.sizeChartId)},
    colorways: [
${colourLines}
    ],
    care: [${p.care.map(q).join(", ")}],
    details: [${p.details.map(q).join(", ")}],
    reviews: [${reviews.length ? `\n${reviewLines}\n    ` : ""}],
  },`;
}).join("\n\n");

const file = `import type { Product, Review, Size, SizeStock } from "./schema.ts";

/* ---------------------------------------------------------------------------
 * GENERATED FILE — do not edit by hand.
 *
 * Source: docs/styles.csv and docs/variants.csv
 * Regenerate with: npm run catalogue:import
 *
 * Hand edits are lost on the next import. Change the spreadsheets instead.
 * ------------------------------------------------------------------------- */

const usd = (dollars: number) => ({ amount: Math.round(dollars * 100), currency: "USD" as const });

/** Stock per size, in SIZE_ORDER. A 0 means genuinely sold out. */
const stock = (xs: number, s: number, m: number, l: number, xl: number, xxl: number): SizeStock[] => [
  { size: "XS", inventory: xs }, { size: "S", inventory: s },
  { size: "M", inventory: m },   { size: "L", inventory: l },
  { size: "XL", inventory: xl }, { size: "XXL", inventory: xxl },
];

let reviewSeq = 0;
const rev = (
  rating: 1 | 2 | 3 | 4 | 5, title: string, body: string, author: string,
  date: string, heightBand: string, sizePurchased: Size,
  fitFeedback: "small" | "true" | "large",
): Review => ({
  id: \`r\${++reviewSeq}\`, rating, title, body, author,
  verified: true, date, heightBand, sizePurchased, fitFeedback,
});

export const PRODUCTS: readonly Product[] = [
${body}
];

export function productByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}
`;

writeFileSync("src/data/catalogue.ts", file);

console.log(`Wrote src/data/catalogue.ts`);
console.log(`  ${parsed.length} styles, ${seenVariant.size} variants`);
console.log(`  ${carried} existing reviews carried across\n`);
console.log(`Next: npm run dev to check, then commit and push.\n`);
