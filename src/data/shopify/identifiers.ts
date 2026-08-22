/**
 * Every namespace/key pair the storefront reads, in one place.
 *
 * WHY THIS FILE EXISTS
 *
 * The custom `fit.*` and `spec.*` identifiers are ours — we create those
 * definitions, so they are known-correct (see scripts/shopify-setup.mjs).
 *
 * The CATEGORY identifiers are Shopify's, generated from the Standard Product
 * Taxonomy, and the exact namespace/key strings are not reliably documented.
 * The values below are the expected convention, not verified fact.
 *
 * Do not trust them. Run:
 *
 *     npm run shopify:doctor
 *
 * which lists the real definitions on your store and flags any mismatch. Then
 * correct this file. Getting these wrong does not error — it silently yields
 * null, which shows up as missing filters rather than a crash, so verify.
 */

export interface MetafieldId {
  readonly namespace: string;
  readonly key: string;
}

/** Ours. Created by scripts/shopify-setup.mjs. */
export const CUSTOM = {
  modelHeight:     { namespace: "fit",  key: "model_height" },
  modelSizeWorn:   { namespace: "fit",  key: "model_size_worn" },
  runsTrueToSize:  { namespace: "fit",  key: "runs_true_to_size" },
  summary:         { namespace: "spec", key: "summary" },
  fitCut:          { namespace: "spec", key: "fit_cut" },
  fabricWeightGsm: { namespace: "spec", key: "fabric_weight_gsm" },
  careInstructions:{ namespace: "spec", key: "care_instructions" },
  details:         { namespace: "spec", key: "details" },
  sizeChart:       { namespace: "spec", key: "size_chart" },
  styleCode:       { namespace: "spec", key: "style_code" },
} as const satisfies Record<string, MetafieldId>;

/** Shopify's. VERIFY with `npm run shopify:doctor` before trusting. */
export const CATEGORY = {
  neckline:      { namespace: "shopify", key: "neckline" },
  sleeveLength:  { namespace: "shopify", key: "sleeve-length-type" },
  topLength:     { namespace: "shopify", key: "top-length-type" },
  fabric:        { namespace: "shopify", key: "fabric" },
  targetGender:  { namespace: "shopify", key: "target-gender" },
  ageGroup:      { namespace: "shopify", key: "age-group" },
  features:      { namespace: "shopify", key: "clothing-features" },
} as const satisfies Record<string, MetafieldId>;

export const ALL_IDENTIFIERS: readonly MetafieldId[] = [
  ...Object.values(CUSTOM),
  ...Object.values(CATEGORY),
];

/** Stable lookup key for a metafield in the flattened response map. */
export const idKey = (id: MetafieldId): string => `${id.namespace}.${id.key}`;
