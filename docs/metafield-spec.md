# Metafield specification

What a client must populate before an apparel storefront can work, and what
you must define in Shopify admin before they can populate it.

Field names mirror [`src/data/schema.ts`](../src/data/schema.ts). Types are
Shopify metafield type identifiers.

**Companion files**

| File | Purpose |
|---|---|
| [`metafield-definitions.json`](metafield-definitions.json) | Every definition, machine-readable. Apply once per store. |
| [`styles-TEMPLATE.csv`](styles-TEMPLATE.csv) | Blank sheet for the client, with one worked example row. |
| [`styles.csv`](styles.csv) | The 12 sample styles, filled. What "done" looks like. |
| [`variants.csv`](variants.csv) | 228 variant rows — every colourway × size, including zeroes. |

Regenerate the filled sheets from live data with `npm run export:sheets`.

---

## The order matters

Doing these out of order means redoing work.

1. **Set the product category** on every product. Nothing below is available
   until a category is assigned — this is the step teams skip.
2. **Create the metaobject definitions** (`size_chart_row`,
   `measure_instruction`, then `size_chart`). References need their target to
   exist first.
3. **Create the custom metafield definitions.**
4. **Create the variant options**, connected to category metafield entries.
5. **Then** hand the client the sheet.

---

## 1. Product category

Assign per product from Shopify's Standard Product Taxonomy.

| Garment | Category |
|---|---|
| T-shirts | `Apparel & Accessories > Clothing > Clothing Tops > T-Shirts` |
| Shirts | `Apparel & Accessories > Clothing > Clothing Tops > Shirts` |
| Knitwear | `Apparel & Accessories > Clothing > Clothing Tops > Sweaters` |
| Trousers | `Apparel & Accessories > Clothing > Pants` |

The category determines which predefined metafields exist. Trousers have no
neckline; tops do.

---

## 2. Variant options — not metafields

**Colour and size are variant options.** This is the thing most often modelled
wrongly, and it is expensive to unpick later.

| Option | Name | Connect to |
|---|---|---|
| Option 1 | Colour | category metafield `color` entries |
| Option 2 | Size | category metafield `size` entries |

Connect each option to its category metafield entries rather than typing free
text. That gives you three things plain text options cannot:

- **Colour swatches** on the storefront variant picker
- **Rename in one place** — change `black` to `graphite` once and every product
  using it updates
- **Standardised values** for Google and Meta channels

It also makes variant grouping automatic. Because colour is an option, one
product *is* one style — so the grid shows one card with swatches instead of
one card per colourway. No `style_code` needed.

> **Migration case.** If the client's existing data has one product per
> colourway, you need `spec.style_code` to regroup them. Prefer restructuring
> to options if you can; it removes the problem instead of working around it.

---

## 3. Category metafields — populate, do not recreate

These are **predefined** by the taxonomy. Recreating them as custom metafields
loses the default entry lists, channel mapping and filter support.

| Category metafield | Schema field | Applies to |
|---|---|---|
| `neckline` | `attributes.neckline` | Tops only |
| `sleeve length type` | `attributes.sleeveLength` | Tops only |
| `top length type` | — | Tops, optional |
| `fabric` | `attributes.fabric` | All |
| `target gender` | `attributes.targetGender` | All |
| `age group` | — | All — set to `Adult` |
| `clothing features` | `attributes.features` | All |

---

## 4. Custom product metafields

Nine definitions. The three under `fit` are the ones that earn their keep.

### Namespace `fit`

| Key | Type | Req | Value |
|---|---|---|---|
| `model_height` | `dimension` | Yes | `{"value": 185.0, "unit": "centimeters"}` |
| `model_size_worn` | `single_line_text_field` | Yes | One of `XS S M L XL XXL` |
| `runs_true_to_size` | `single_line_text_field` | Yes | One of `small` `true` `large` |

**`model_height` + `model_size_worn` are the highest-value fields in this
entire spec.** Together they render one line — *"Model is 6′1″, wearing size
L"* — that does more for conversion than most features you could build. They
must be recorded at the shoot. There is no way to recover them afterwards
except by reshooting or finding the studio's notes.

Put them on the client's shoot checklist in the first meeting.

`runs_true_to_size` set to `small` or `large` prints a sizing warning on the
page. Publishing that does not lose sales — it prevents returns by steering
the shopper to the right size.

### Namespace `spec`

| Key | Type | Req | Notes |
|---|---|---|---|
| `summary` | `single_line_text_field` | Yes | Max 120 chars. Cards and search results. |
| `fit_cut` | `single_line_text_field` | Yes | `Slim` `Regular` `Relaxed` `Oversized` — these four only |
| `fabric_weight_gsm` | `number_integer` | Yes | 40–900. From the mill spec sheet. |
| `care_instructions` | `list.single_line_text_field` | Yes | One instruction per entry, not a paragraph |
| `details` | `list.single_line_text_field` | No | Specific checkable facts only |
| `size_chart` | `metaobject_reference` | Yes | → `size_chart` definition |
| `style_code` | `single_line_text_field` | No | Migration only — see §2 |

`fit_cut` must stay within those four values. Per-style invention — "easy",
"boxy", "generous" — turns the fit filter into noise. This is the most common
place client data quality degrades, so state the constraint explicitly and
validate it on import.

Set **storefront access** on all of these, or the storefront cannot read them.

---

## 5. Metaobject definitions

Size charts are authored once and referenced by many products, so a
measurement correction is one edit rather than twelve.

### `size_chart`

| Field | Type | Req |
|---|---|---|
| `name` | `single_line_text_field` | Yes |
| `measurement_basis` | `single_line_text_field` — `Garment` or `Body` | Yes |
| `rows` | `list.metaobject_reference` → `size_chart_row` | Yes |
| `how_to_measure` | `list.metaobject_reference` → `measure_instruction` | Yes |

`measurement_basis` is not optional detail. Conflating garment measurements
with body measurements is itself a return driver, so the page states which
it is showing.

`how_to_measure` matters as much as the numbers. A chart without instructions
is guesswork — the shopper needs to know where to put the tape.

### `size_chart_row`

| Field | Type | Req |
|---|---|---|
| `size` | `single_line_text_field` — `XS`…`XXL` | Yes |
| `chest_cm` | `dimension` | No — omit for trousers |
| `waist_cm` | `dimension` | Yes |
| `length_cm` | `dimension` | Yes |

### `measure_instruction`

| Field | Type | Req |
|---|---|---|
| `part` | `single_line_text_field` | Yes |
| `instruction` | `multi_line_text_field` | Yes |

Three charts cover a typical range: tops, knitwear, trousers.

---

## 6. What is NOT a metafield

Modelling these as metafields is a common and costly mistake.

| Thing | Where it belongs |
|---|---|
| **Inventory per size** | Native variant field. Stock-aware size filters depend on this being accurate per size in real time. If it syncs nightly, do not ship the filter. |
| Price, compare-at price | Native variant fields |
| SKU, barcode | Native variant fields |
| Product images | Product media, assigned per colourway variant |
| Long description | Native product description |
| **Reviews with fit data** | A reviews platform. Reviewer height, size purchased and true-to-size come from Okendo or similar. Building this as metafields means also building collection, moderation and request timing. |
| Returns policy | Store-level shared content, so it cannot drift between pages |

---

## Completeness gate

Do not launch a product with any of these empty:

- [ ] `fit.model_height`
- [ ] `fit.model_size_worn`
- [ ] `fit.runs_true_to_size`
- [ ] `spec.size_chart`
- [ ] `spec.fabric_weight_gsm`
- [ ] `spec.fit_cut`
- [ ] Category assigned
- [ ] `category:fabric`
- [ ] Inventory set for every colourway × size, including zeroes

`npm run export:sheets` prints completeness for the required fields. Wire the
same check into the import so incomplete products cannot go live.

---

## Effort estimate

Per style, for someone with the mill spec sheet and shoot notes to hand:

| Task | Time |
|---|---|
| Style-level fields | ~6 min |
| Category metafields | ~2 min |
| Variants — colourway × size with inventory | ~1 min per colourway |
| Size chart | once per chart, ~15 min |

A 12-style, 38-colourway range is roughly **3–4 hours** of data entry, plus
chart authoring — *if* the source information exists. Discovering that model
heights were never recorded is the thing that turns this into a reshoot.

Ask before quoting.
