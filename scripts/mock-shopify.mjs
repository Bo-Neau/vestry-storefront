/**
 * Mock Shopify Storefront API.
 *
 *   npm run shopify:mock          # listens on :4500
 *
 * Serves responses shaped like the real Storefront API, generated from the
 * sample catalogue. Two reasons it exists:
 *
 *  1. The integration (client, queries, mapper, cart) is ~800 lines that
 *     otherwise cannot be exercised without a real store and credentials.
 *  2. Because the payloads are generated FROM the sample catalogue, mapping
 *     them back should reproduce the original products — a round-trip check
 *     that catches field-name and shape mistakes precisely.
 *
 * It is a test double, not a simulator: no auth beyond a token presence
 * check, no rate limits, no pagination beyond one page.
 */
import { createServer } from "node:http";
import { PRODUCTS } from "../src/data/catalogue.ts";
import { SIZE_CHARTS } from "../src/data/size-charts.ts";

const PORT = Number(process.env.MOCK_PORT ?? 4500);

const CATEGORY_TYPE = {
  "T-shirts": "T-Shirts", "Shirts": "Shirts",
  "Knitwear": "Sweaters", "Trousers": "Pants",
};

let gidCounter = 1000;
const gid = (type) => `gid://shopify/${type}/${gidCounter++}`;

/* ---------- metaobject helpers ---------- */

/** Category metafields resolve to taxonomy entries whose display name is on
 *  the reference, not in `value`. Reproducing that is the point. */
const entry = (name) => ({
  id: gid("Metaobject"),
  type: "taxonomy_value",
  fields: [{ key: "name", value: name, references: null }],
});

const dimension = (cm) => JSON.stringify({ value: cm, unit: "centimeters" });

const chartMetaobject = (chart) => ({
  id: gid("Metaobject"),
  handle: chart.id,
  type: "size_chart",
  fields: [
    { key: "name", value: chart.name, references: null },
    { key: "measurement_basis", value: "Garment", references: null },
    {
      key: "rows",
      value: null,
      references: {
        nodes: chart.rows.map((r) => ({
          id: gid("Metaobject"),
          type: "size_chart_row",
          fields: [
            { key: "size", value: r.size },
            { key: "chest_cm", value: r.chestCm > 0 ? dimension(r.chestCm) : null },
            { key: "waist_cm", value: dimension(r.waistCm) },
            { key: "length_cm", value: dimension(r.lengthCm) },
          ],
        })),
      },
    },
    {
      key: "how_to_measure",
      value: null,
      references: {
        nodes: chart.howToMeasure.map((h) => ({
          id: gid("Metaobject"),
          type: "measure_instruction",
          fields: [
            { key: "part", value: h.part },
            { key: "instruction", value: h.instruction },
          ],
        })),
      },
    },
  ],
});

/* ---------- product -> Storefront shape ---------- */

const variantIds = new Map(); // `${handle}|${colour}|${size}` -> gid

function toStorefrontProduct(p) {
  const chart = SIZE_CHARTS.find((c) => c.id === p.sizeChartId);

  const variants = [];
  for (const c of p.colorways) {
    for (const s of c.sizes) {
      const key = `${p.handle}|${c.name}|${s.size}`;
      const id = variantIds.get(key) ?? gid("ProductVariant");
      variantIds.set(key, id);
      variants.push({
        id,
        sku: `${p.handle}-${c.id}-${s.size}`,
        availableForSale: s.inventory > 0,
        quantityAvailable: s.inventory,
        selectedOptions: [
          { name: "Colour", value: c.name },
          { name: "Size", value: s.size },
        ],
        price: { amount: (p.price.amount / 100).toFixed(2), currencyCode: "USD" },
        compareAtPrice: p.compareAtPrice
          ? { amount: (p.compareAtPrice.amount / 100).toFixed(2), currencyCode: "USD" }
          : null,
      });
    }
  }

  // Metafields come back POSITIONALLY, aligned to the identifiers argument,
  // with null where a product has no value. Order and nulls both matter.
  const custom = {
    "fit.model_height": {
      type: "dimension", value: dimension(p.fit.modelHeightCm), reference: null,
    },
    "fit.model_size_worn": {
      type: "single_line_text_field", value: p.fit.modelSizeWorn, reference: null,
    },
    "fit.runs_true_to_size": {
      type: "single_line_text_field", value: p.fit.runsTrueToSize, reference: null,
    },
    "spec.summary": {
      type: "single_line_text_field", value: p.summary, reference: null,
    },
    "spec.fit_cut": {
      type: "single_line_text_field", value: p.attributes.fit, reference: null,
    },
    "spec.fabric_weight_gsm": {
      type: "number_integer", value: String(p.attributes.fabricWeightGsm), reference: null,
    },
    "spec.care_instructions": {
      type: "list.single_line_text_field", value: JSON.stringify(p.care), reference: null,
    },
    "spec.details": {
      type: "list.single_line_text_field", value: JSON.stringify(p.details), reference: null,
    },
    "spec.size_chart": {
      type: "metaobject_reference",
      value: gid("Metaobject"),
      reference: chart ? chartMetaobject(chart) : null,
    },
    "spec.style_code": {
      type: "single_line_text_field", value: p.id, reference: null,
    },
    "shopify.neckline": p.attributes.neckline
      ? { type: "metaobject_reference", value: gid("Metaobject"), reference: entry(p.attributes.neckline) }
      : null,
    "shopify.sleeve-length-type": p.attributes.sleeveLength
      ? { type: "metaobject_reference", value: gid("Metaobject"), reference: entry(p.attributes.sleeveLength) }
      : null,
    "shopify.top-length-type": null,
    "shopify.fabric": {
      type: "metaobject_reference", value: gid("Metaobject"), reference: entry(p.attributes.fabric),
    },
    "shopify.target-gender": {
      type: "metaobject_reference", value: gid("Metaobject"), reference: entry(p.attributes.targetGender),
    },
    "shopify.age-group": {
      type: "metaobject_reference", value: gid("Metaobject"), reference: entry("Adult"),
    },
    "shopify.clothing-features": {
      type: "list.metaobject_reference",
      value: JSON.stringify(p.attributes.features.map(() => gid("Metaobject"))),
      reference: null,
      references: { nodes: p.attributes.features.map((f) => entry(f)) },
    },
  };

  return {
    id: `gid://shopify/Product/${p.handle}`,
    handle: p.handle,
    title: p.title,
    description: p.description,
    productType: CATEGORY_TYPE[p.category] ?? p.category,
    options: [
      {
        name: "Colour",
        optionValues: p.colorways.map((c) => ({
          name: c.name,
          swatch: { color: c.hex },
        })),
      },
      {
        name: "Size",
        optionValues: [...new Set(p.colorways.flatMap((c) => c.sizes.map((s) => s.size)))]
          .map((name) => ({ name, swatch: null })),
      },
    ],
    priceRange: { minVariantPrice: { amount: (p.price.amount / 100).toFixed(2), currencyCode: "USD" } },
    compareAtPriceRange: p.compareAtPrice
      ? { minVariantPrice: { amount: (p.compareAtPrice.amount / 100).toFixed(2), currencyCode: "USD" } }
      : null,
    variants: { nodes: variants },
    __metafields: custom,
  };
}

const CATALOGUE = PRODUCTS.map(toStorefrontProduct);

/** Aligns metafields to the identifiers the query asked for. */
function metafieldsFor(product, query) {
  const ids = [...query.matchAll(/\{namespace:"([^"]+)",key:"([^"]+)"\}/g)]
    .map((m) => `${m[1]}.${m[2]}`);
  return ids.map((key) => {
    const mf = product.__metafields[key];
    if (!mf) return null; // absent metafields come back as null, not omitted
    const [namespace, ...rest] = key.split(".");
    return {
      namespace,
      key: rest.join("."),
      type: mf.type,
      value: mf.value,
      reference: mf.reference ?? null,
      references: mf.references ?? null,
    };
  });
}

const strip = (p, query) => {
  const { __metafields, ...rest } = p;
  return { ...rest, metafields: metafieldsFor(p, query) };
};

/* ---------- carts ---------- */

const carts = new Map();

const variantLookup = new Map();
for (const p of CATALOGUE) {
  for (const v of p.variants.nodes) {
    variantLookup.set(v.id, { product: p, variant: v });
  }
}

function cartPayload(id) {
  const cart = carts.get(id);
  const lines = cart.lines.map((l) => {
    const found = variantLookup.get(l.merchandiseId);
    return {
      id: l.id,
      quantity: l.quantity,
      merchandise: {
        id: l.merchandiseId,
        quantityAvailable: found?.variant.quantityAvailable ?? 0,
        selectedOptions: found?.variant.selectedOptions ?? [],
        price: found?.variant.price ?? { amount: "0.00", currencyCode: "USD" },
        product: {
          handle: found?.product.handle ?? "unknown",
          title: found?.product.title ?? "Unknown",
        },
      },
    };
  });
  const subtotal = lines.reduce(
    (t, l) => t + Number.parseFloat(l.merchandise.price.amount) * l.quantity, 0,
  );
  return {
    id,
    checkoutUrl: `https://mock-store.myshopify.com/checkouts/${id.split("/").pop()}`,
    totalQuantity: lines.reduce((t, l) => t + l.quantity, 0),
    cost: { subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: "USD" } },
    lines: { nodes: lines },
  };
}

/* ---------- server ---------- */

let requestCount = 0;

const server = createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405).end("POST only");
    return;
  }
  if (!req.headers["x-shopify-storefront-access-token"]) {
    res.writeHead(401, { "Content-Type": "application/json" })
       .end(JSON.stringify({ errors: [{ message: "Missing access token" }] }));
    return;
  }

  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", () => {
    requestCount += 1;
    let parsed;
    try { parsed = JSON.parse(body); }
    catch { res.writeHead(400).end("bad json"); return; }

    const { query = "", variables = {} } = parsed;
    const send = (data) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data }));
    };

    if (query.includes("shop {")) {
      return send({ shop: { name: "Mock Store", primaryDomain: { url: "https://mock-store.myshopify.com" } } });
    }

    if (query.includes("query Products")) {
      return send({
        products: {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: CATALOGUE.map((p) => strip(p, query)),
        },
      });
    }

    if (query.includes("query ProductByHandle")) {
      const p = CATALOGUE.find((x) => x.handle === variables.handle);
      return send({ product: p ? strip(p, query) : null });
    }

    if (query.includes("mutation CartCreate")) {
      const id = gid("Cart");
      carts.set(id, {
        lines: (variables.lines ?? []).map((l, i) => ({
          id: `${id}/line/${i}`, merchandiseId: l.merchandiseId, quantity: l.quantity,
        })),
      });
      return send({ cartCreate: { cart: cartPayload(id), userErrors: [] } });
    }

    if (query.includes("query Cart")) {
      return send({ cart: carts.has(variables.id) ? cartPayload(variables.id) : null });
    }

    if (query.includes("mutation CartLinesAdd")) {
      const cart = carts.get(variables.cartId);
      if (!cart) return send({ cartLinesAdd: { cart: null, userErrors: [{ message: "Cart not found" }] } });
      for (const l of variables.lines ?? []) {
        const existing = cart.lines.find((x) => x.merchandiseId === l.merchandiseId);
        if (existing) existing.quantity += l.quantity;
        else cart.lines.push({ id: `${variables.cartId}/line/${cart.lines.length}`, merchandiseId: l.merchandiseId, quantity: l.quantity });
      }
      return send({ cartLinesAdd: { cart: cartPayload(variables.cartId), userErrors: [] } });
    }

    if (query.includes("mutation CartLinesUpdate")) {
      const cart = carts.get(variables.cartId);
      for (const l of variables.lines ?? []) {
        const line = cart.lines.find((x) => x.id === l.id);
        if (line) line.quantity = l.quantity;
      }
      return send({ cartLinesUpdate: { cart: cartPayload(variables.cartId), userErrors: [] } });
    }

    if (query.includes("mutation CartLinesRemove")) {
      const cart = carts.get(variables.cartId);
      cart.lines = cart.lines.filter((x) => !(variables.lineIds ?? []).includes(x.id));
      return send({ cartLinesRemove: { cart: cartPayload(variables.cartId), userErrors: [] } });
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ errors: [{ message: `Mock has no handler for this query` }] }));
  });
});

server.listen(PORT, () => {
  console.log(`Mock Shopify Storefront API on http://localhost:${PORT}`);
  console.log(`  ${CATALOGUE.length} products, ${variantLookup.size} variants\n`);
  console.log(`Point the app at it:`);
  console.log(`  SHOPIFY_STORE_DOMAIN=localhost:${PORT}`);
  console.log(`  SHOPIFY_STOREFRONT_TOKEN=mock-token\n`);
});

process.on("SIGTERM", () => { console.log(`\n${requestCount} requests served`); server.close(); });
