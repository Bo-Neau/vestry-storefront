/**
 * Creates every metafield and metaobject definition the storefront needs.
 *
 *   npm run shopify:setup
 *
 * Idempotent: existing definitions are left alone and reported as skipped, so
 * it is safe to re-run after a partial failure.
 *
 * Order matters — size_chart references size_chart_row and
 * measure_instruction, so those are created first and their ids fed in.
 */
import { admin, requireAdmin, userErrors, tick } from "./lib/admin.mjs";

requireAdmin();

const v = (name, value) => ({ name, value });

/* ---------------- metaobject definitions ---------------- */

const METAOBJECTS = [
  {
    type: "size_chart_row",
    name: "Size chart row",
    fieldDefinitions: [
      { key: "size", name: "Size", type: "single_line_text_field", required: true,
        validations: [v("choices", JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]))] },
      { key: "chest_cm",  name: "Chest",  type: "dimension", required: false },
      { key: "waist_cm",  name: "Waist",  type: "dimension", required: true },
      { key: "length_cm", name: "Length", type: "dimension", required: true },
    ],
  },
  {
    type: "measure_instruction",
    name: "Measuring instruction",
    fieldDefinitions: [
      { key: "part",        name: "Part",        type: "single_line_text_field", required: true },
      { key: "instruction", name: "Instruction", type: "multi_line_text_field",  required: true },
    ],
  },
];

/** Built after the two above exist, since it references their ids. */
const sizeChartDefinition = (rowId, howId) => ({
  type: "size_chart",
  name: "Size chart",
  fieldDefinitions: [
    { key: "name", name: "Name", type: "single_line_text_field", required: true },
    { key: "measurement_basis", name: "Measurement basis",
      type: "single_line_text_field", required: true,
      validations: [v("choices", JSON.stringify(["Garment", "Body"]))] },
    { key: "rows", name: "Rows", type: "list.metaobject_reference", required: true,
      validations: [v("metaobject_definition_id", rowId)] },
    { key: "how_to_measure", name: "How to measure",
      type: "list.metaobject_reference", required: true,
      validations: [v("metaobject_definition_id", howId)] },
  ],
});

/* ---------------- product metafield definitions ---------------- */

const PRODUCT_METAFIELDS = [
  { namespace: "fit", key: "model_height", name: "Model height", type: "dimension",
    description: "Height of the model in the product photography. Record at the shoot." },
  { namespace: "fit", key: "model_size_worn", name: "Model size worn",
    type: "single_line_text_field",
    description: "The size the model is wearing.",
    validations: [v("choices", JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]))] },
  { namespace: "fit", key: "runs_true_to_size", name: "Runs true to size",
    type: "single_line_text_field",
    description: "Whether the garment runs small, true, or large.",
    validations: [v("choices", JSON.stringify(["small", "true", "large"]))] },

  { namespace: "spec", key: "summary", name: "Short summary",
    type: "single_line_text_field",
    description: "One line for cards and search results.",
    validations: [v("max", "120")] },
  { namespace: "spec", key: "fit_cut", name: "Cut", type: "single_line_text_field",
    description: "How close the garment is cut.",
    validations: [v("choices", JSON.stringify(["Slim", "Regular", "Relaxed", "Oversized"]))] },
  { namespace: "spec", key: "fabric_weight_gsm", name: "Fabric weight (gsm)",
    type: "number_integer",
    description: "Fabric weight in grams per square metre.",
    validations: [v("min", "40"), v("max", "900")] },
  { namespace: "spec", key: "care_instructions", name: "Care instructions",
    type: "list.single_line_text_field",
    description: "One care step per entry." },
  { namespace: "spec", key: "details", name: "Product details",
    type: "list.single_line_text_field",
    description: "Provenance and construction notes. Specific facts only." },
  { namespace: "spec", key: "style_code", name: "Style code",
    type: "single_line_text_field",
    description: "Style-level id, for stores with one product per colourway." },
];

/* ---------------- mutations ---------------- */

const MO_CREATE = `
  mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message code }
    }
  }
`;

const MF_CREATE = `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id namespace key }
      userErrors { field message code }
    }
  }
`;

/* ---------------- run ---------------- */

console.log("\nCreating definitions\n");

// Existing metaobjects
const existingMo = await admin(`{ metaobjectDefinitions(first: 100) { nodes { id type } } }`);
const moByType = new Map(existingMo.metaobjectDefinitions.nodes.map((n) => [n.type, n.id]));

async function ensureMetaobject(def) {
  if (moByType.has(def.type)) {
    console.log(`  ${tick(true)} ${def.type.padEnd(22)} already exists (skipped)`);
    return moByType.get(def.type);
  }
  const data = await admin(MO_CREATE, {
    definition: {
      ...def,
      // Storefront must be able to read these or the size guide is invisible.
      access: { storefront: "PUBLIC_READ" },
    },
  });
  const payload = data.metaobjectDefinitionCreate;
  const err = userErrors(payload);
  if (err) {
    console.log(`  ${tick(false)} ${def.type.padEnd(22)} ${err}`);
    return null;
  }
  const id = payload.metaobjectDefinition.id;
  moByType.set(def.type, id);
  console.log(`  ${tick(true)} ${def.type.padEnd(22)} created`);
  return id;
}

console.log("Metaobject definitions");
const rowId = await ensureMetaobject(METAOBJECTS[0]);
const howId = await ensureMetaobject(METAOBJECTS[1]);

if (rowId && howId) {
  await ensureMetaobject(sizeChartDefinition(rowId, howId));
} else {
  console.log(`  ${tick(false)} size_chart skipped — its referenced definitions failed`);
}

// Existing product metafields
const existingMf = await admin(`
  { metafieldDefinitions(first: 250, ownerType: PRODUCT) { nodes { namespace key } } }
`);
const mfKeys = new Set(
  existingMf.metafieldDefinitions.nodes.map((n) => `${n.namespace}.${n.key}`),
);

console.log("\nProduct metafield definitions");
let created = 0, skipped = 0, failed = 0;

for (const def of PRODUCT_METAFIELDS) {
  const key = `${def.namespace}.${def.key}`;
  if (mfKeys.has(key)) {
    console.log(`  ${tick(true)} ${key.padEnd(26)} already exists (skipped)`);
    skipped += 1;
    continue;
  }
  const data = await admin(MF_CREATE, {
    definition: {
      ...def,
      ownerType: "PRODUCT",
      // Without PUBLIC_READ the Storefront API cannot see the value at all.
      access: { storefront: "PUBLIC_READ" },
    },
  });
  const err = userErrors(data.metafieldDefinitionCreate);
  if (err) {
    console.log(`  ${tick(false)} ${key.padEnd(26)} ${err}`);
    failed += 1;
  } else {
    console.log(`  ${tick(true)} ${key.padEnd(26)} created`);
    created += 1;
  }
}

// size_chart reference metafield last — needs the metaobject definition id.
const sizeChartDefId = moByType.get("size_chart");
if (sizeChartDefId && !mfKeys.has("spec.size_chart")) {
  const data = await admin(MF_CREATE, {
    definition: {
      namespace: "spec", key: "size_chart", name: "Size chart",
      type: "metaobject_reference", ownerType: "PRODUCT",
      description: "Which size chart applies to this product.",
      validations: [v("metaobject_definition_id", sizeChartDefId)],
      access: { storefront: "PUBLIC_READ" },
    },
  });
  const err = userErrors(data.metafieldDefinitionCreate);
  if (err) { console.log(`  ${tick(false)} spec.size_chart            ${err}`); failed += 1; }
  else { console.log(`  ${tick(true)} spec.size_chart            created`); created += 1; }
} else if (mfKeys.has("spec.size_chart")) {
  console.log(`  ${tick(true)} spec.size_chart            already exists (skipped)`);
  skipped += 1;
}

console.log(`\n${created} created, ${skipped} skipped, ${failed} failed`);
console.log(
  failed === 0
    ? "\nNext: npm run shopify:seed, then npm run shopify:doctor\n"
    : "\nFix the failures above and re-run. This script is safe to repeat.\n",
);
process.exit(failed === 0 ? 0 : 1);
