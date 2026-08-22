import { SIZE_ORDER } from "../schema.ts";
import type {
  Category, Colorway, Fit, GarmentShape, Money, Neckline, Product,
  SizeChart, SizeChartRow, SizeStock, Size, SleeveLength, TargetGender,
} from "../schema.ts";
import { CATEGORY, CUSTOM, idKey } from "./identifiers.ts";
import type { MetafieldId } from "./identifiers.ts";

/* ---------------- raw response shapes ---------------- */

interface RawMoney { amount: string; currencyCode: string }
interface RawMetaobjectField {
  key: string;
  value: string | null;
  references?: { nodes: RawMetaobject[] } | null;
}
interface RawMetaobject {
  id: string;
  type?: string;
  handle?: string;
  fields: RawMetaobjectField[];
}
interface RawMetafield {
  namespace: string;
  key: string;
  type: string;
  value: string | null;
  /** Single reference — e.g. size_chart, or one category entry. */
  reference?: RawMetaobject | null;
  /** List of references — e.g. clothing features. */
  references?: { nodes: RawMetaobject[] } | null;
}
interface RawVariant {
  id: string;
  sku: string | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: { name: string; value: string }[];
  price: RawMoney;
  compareAtPrice: RawMoney | null;
}
export interface RawProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string | null;
  options: { name: string; optionValues: { name: string; swatch?: { color: string | null } | null }[] }[];
  priceRange: { minVariantPrice: RawMoney };
  compareAtPriceRange: { minVariantPrice: RawMoney } | null;
  variants: { nodes: RawVariant[] };
  metafields: (RawMetafield | null)[];
}

/* ---------------- helpers ---------------- */

/** Metafields come back positionally with nulls for absent ones. */
function indexMetafields(raw: (RawMetafield | null)[]): Map<string, RawMetafield> {
  const map = new Map<string, RawMetafield>();
  for (const mf of raw) {
    if (mf) map.set(`${mf.namespace}.${mf.key}`, mf);
  }
  return map;
}

const text = (m: Map<string, RawMetafield>, id: MetafieldId): string | undefined => {
  const v = m.get(idKey(id))?.value;
  return v && v.trim().length > 0 ? v.trim() : undefined;
};

const int = (m: Map<string, RawMetafield>, id: MetafieldId): number | undefined => {
  const v = text(m, id);
  if (v === undefined) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
};

/** `dimension` is JSON: {"value":185.0,"unit":"centimeters"} */
function dimensionCm(m: Map<string, RawMetafield>, id: MetafieldId): number | undefined {
  const v = text(m, id);
  if (!v) return undefined;
  try {
    const parsed = JSON.parse(v) as { value?: number; unit?: string };
    if (typeof parsed.value !== "number") return undefined;
    switch (parsed.unit) {
      case "millimeters": return parsed.value / 10;
      case "centimeters": return parsed.value;
      case "meters":      return parsed.value * 100;
      case "inches":      return parsed.value * 2.54;
      case "feet":        return parsed.value * 30.48;
      default:            return parsed.value; // assume cm
    }
  } catch {
    return undefined;
  }
}

/** `list.single_line_text_field` is a JSON array of strings. */
function list(m: Map<string, RawMetafield>, id: MetafieldId): string[] {
  const v = text(m, id);
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

const money = (raw: RawMoney): Money => ({
  amount: Math.round(Number.parseFloat(raw.amount) * 100),
  currency: "USD",
});

/**
 * Category metafields resolve to metaobject entries, so the display name is
 * on the reference rather than in `value` (which holds a gid).
 */
function categoryValue(m: Map<string, RawMetafield>, id: MetafieldId): string | undefined {
  const mf = m.get(idKey(id));
  if (!mf) return undefined;
  const named = mf.reference?.fields.find((f) => f.key === "name" || f.key === "label");
  if (named?.value) return named.value.trim();
  const v = mf.value?.trim();
  // A bare gid is not a display value — treat it as absent.
  if (!v || v.startsWith("gid://")) return undefined;
  return v;
}

/**
 * List-valued category metafields (e.g. clothing features) resolve to a set
 * of metaobject entries; the display name lives on each entry.
 */
function categoryValueList(m: Map<string, RawMetafield>, id: MetafieldId): string[] {
  const mf = m.get(idKey(id));
  const nodes = mf?.references?.nodes ?? [];
  const names = nodes
    .map((n) => n.fields.find((f) => f.key === "name" || f.key === "label")?.value?.trim())
    .filter((v): v is string => Boolean(v));
  if (names.length > 0) return names;
  // Some stores store plain text lists instead of taxonomy entries.
  const raw = mf?.value?.trim();
  if (raw && raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter((v) => !v.startsWith("gid://"));
    } catch { /* fall through */ }
  }
  return [];
}

function oneOf<T extends string>(
  value: string | undefined, allowed: readonly T[], fallback: T,
): T {
  if (!value) return fallback;
  const hit = allowed.find((a) => a.toLowerCase() === value.toLowerCase());
  return hit ?? fallback;
}

const SHAPE_BY_CATEGORY: Record<Category, GarmentShape> = {
  "Outerwear": "jacket", "Tops": "top", "Skirts": "skirt", "Dresses": "gown",
};

function categoryFor(productType: string | null): Category {
  const t = (productType ?? "").toLowerCase();
  if (t.includes("dress") || t.includes("gown")) return "Dresses";
  if (t.includes("skirt")) return "Skirts";
  if (t.includes("jacket") || t.includes("coat") || t.includes("cape") || t.includes("outer")) return "Outerwear";
  return "Tops";
}

/* ---------------- size chart ---------------- */

const chartCache = new Map<string, SizeChart>();

function fieldValue(o: RawMetaobject, key: string): string | undefined {
  return o.fields.find((f) => f.key === key)?.value ?? undefined;
}

/** dimension JSON on a metaobject field -> cm number */
function rowCm(o: RawMetaobject, key: string): number {
  const v = fieldValue(o, key);
  if (!v) return 0;
  try {
    const parsed = JSON.parse(v) as { value?: number };
    return typeof parsed.value === "number" ? parsed.value : 0;
  } catch {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
}

function mapSizeChart(ref: RawMetaobject): SizeChart {
  const rowsField = ref.fields.find((f) => f.key === "rows");
  const rows: SizeChartRow[] = (rowsField?.references?.nodes ?? []).map((r) => ({
    size: oneOf(fieldValue(r, "size"), SIZE_ORDER, "M"),
    chestCm: rowCm(r, "chest_cm"),
    waistCm: rowCm(r, "waist_cm"),
    lengthCm: rowCm(r, "length_cm"),
  }));

  const howField = ref.fields.find((f) => f.key === "how_to_measure");
  const howToMeasure = (howField?.references?.nodes ?? []).map((h) => ({
    part: fieldValue(h, "part") ?? "",
    instruction: fieldValue(h, "instruction") ?? "",
  }));

  // Keep chart rows in size order regardless of admin entry order.
  rows.sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));

  return {
    id: ref.id,
    name: fieldValue(ref, "name") ?? "Size guide",
    rows,
    howToMeasure,
  };
}

export function cachedSizeChart(id: string): SizeChart | undefined {
  return chartCache.get(id);
}

/* ---------------- variants -> colorways ---------------- */

const optionValue = (v: RawVariant, name: string): string | undefined =>
  v.selectedOptions.find((o) => o.name.toLowerCase() === name.toLowerCase())?.value;

/**
 * Groups variants into colourways, each carrying real per-size inventory.
 *
 * `quantityAvailable` is null unless the app has the
 * unauthenticated_read_product_inventory scope. Falling back to
 * availableForSale keeps the page correct (in stock vs sold out) but loses
 * the low-stock threshold, so the doctor script warns when it is null.
 */
function mapColorways(raw: RawProduct): Colorway[] {
  const colourOption = raw.options.find((o) => /colour|color/i.test(o.name));
  const swatchByName = new Map<string, string>();
  for (const ov of colourOption?.optionValues ?? []) {
    if (ov.swatch?.color) swatchByName.set(ov.name, ov.swatch.color);
  }

  const byColour = new Map<string, SizeStock[]>();
  for (const v of raw.variants.nodes) {
    const colour = optionValue(v, "Colour") ?? optionValue(v, "Color") ?? "Default";
    const sizeRaw = optionValue(v, "Size");
    const size = SIZE_ORDER.find((s) => s.toLowerCase() === (sizeRaw ?? "").toLowerCase());
    if (!size) continue; // sizes outside our scale are ignored, not guessed

    const inventory = v.quantityAvailable ?? (v.availableForSale ? 1 : 0);
    const bucket = byColour.get(colour) ?? [];
    bucket.push({ size, inventory: Math.max(0, inventory), variantId: v.id });
    byColour.set(colour, bucket);
  }

  return [...byColour.entries()].map(([name, sizes]) => {
    // Every size present, so absence and zero stay distinguishable.
    const complete: SizeStock[] = SIZE_ORDER.map((size) => {
      const found = sizes.find((s) => s.size === size);
      return {
        size,
        inventory: found?.inventory ?? 0,
        ...(found?.variantId ? { variantId: found.variantId } : {}),
      };
    });
    return {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      hex: swatchByName.get(name) ?? "#B4B4AE",
      sizes: complete,
    };
  });
}

/* ---------------- product ---------------- */

export function mapProduct(raw: RawProduct): Product {
  const m = indexMetafields(raw.metafields);

  const sizeChartRef = m.get(idKey(CUSTOM.sizeChart))?.reference;
  let sizeChartId = "";
  if (sizeChartRef) {
    const chart = mapSizeChart(sizeChartRef);
    chartCache.set(chart.id, chart);
    sizeChartId = chart.id;
  }

  const category = categoryFor(raw.productType);
  const compareAt = raw.compareAtPriceRange?.minVariantPrice;
  const price = money(raw.priceRange.minVariantPrice);
  const compareAtMoney = compareAt ? money(compareAt) : undefined;

  return {
    id: text(m, CUSTOM.styleCode) ?? raw.id,
    platformId: raw.id,
    handle: raw.handle,
    title: raw.title,
    category,
    shape: SHAPE_BY_CATEGORY[category],
    price,
    // Shopify reports compareAtPrice even when equal; only a real discount counts.
    ...(compareAtMoney && compareAtMoney.amount > price.amount
      ? { compareAtPrice: compareAtMoney }
      : {}),
    summary: text(m, CUSTOM.summary) ?? raw.description.split(/(?<=\.)\s/)[0] ?? "",
    description: raw.description,
    attributes: {
      fit: oneOf<Fit>(text(m, CUSTOM.fitCut), ["Fitted", "Tailored", "Draped", "Sculptural"], "Tailored"),
      ...(categoryValue(m, CATEGORY.neckline)
        ? { neckline: oneOf<Neckline>(categoryValue(m, CATEGORY.neckline), ["High neck", "Mandarin", "Collared", "Round", "Open"], "Round") }
        : {}),
      ...(categoryValue(m, CATEGORY.sleeveLength)
        ? { sleeveLength: oneOf<SleeveLength>(categoryValue(m, CATEGORY.sleeveLength), ["Sleeveless", "Short", "Three-quarter", "Long"], "Long") }
        : {}),
      fabric: categoryValue(m, CATEGORY.fabric) ?? "—",
      fabricWeightGsm: int(m, CUSTOM.fabricWeightGsm) ?? 0,
      targetGender: oneOf<TargetGender>(categoryValue(m, CATEGORY.targetGender), ["Men", "Women", "Unisex"], "Unisex"),
      features: categoryValueList(m, CATEGORY.features),
    },
    fit: {
      modelHeightCm: dimensionCm(m, CUSTOM.modelHeight) ?? 0,
      modelSizeWorn: oneOf<Size>(text(m, CUSTOM.modelSizeWorn), SIZE_ORDER, "M"),
      runsTrueToSize: oneOf(text(m, CUSTOM.runsTrueToSize), ["small", "true", "large"] as const, "true"),
    },
    sizeChartId,
    colorways: mapColorways(raw),
    care: list(m, CUSTOM.careInstructions),
    details: list(m, CUSTOM.details),
    // Reviews come from a reviews platform, never from metafields.
    reviews: [],
  };
}
