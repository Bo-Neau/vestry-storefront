# Connecting to a Shopify dev store

The storefront runs on sample data until you point it at a store. Nothing
below changes the app's behaviour — it only supplies credentials.

**On credentials.** Everything in this guide happens in your Shopify admin and
your local `.env`. Don't paste tokens into a chat, a ticket, or a commit.
`.env` is gitignored.

---

## What you do vs what the scripts do

| | |
|---|---|
| **You** | Create the Partner account and dev store, create a custom app, grant scopes, copy two tokens into `.env` |
| **`npm run shopify:setup`** | Creates 10 metafield definitions and 3 metaobject definitions |
| **`npm run shopify:seed`** | Creates 12 products, 228 variants, 3 size charts |
| **`npm run shopify:doctor`** | Verifies all of it and tells you what is wrong |

---

## 1. Create the store

1. Sign up at [partners.shopify.com](https://partners.shopify.com) — free.
2. **Stores → Add store → Create development store**.
3. Choose "Start with a template or empty store". Empty is fine.

Dev stores are free, never charge, and cannot take real payments.

## 2. Create a custom app

In your store admin: **Settings → Apps and sales channels → Develop apps →
Create an app**. Name it anything.

### Admin API scopes

Under **Configuration → Admin API integration**, enable:

```
read_products, write_products
read_inventory, write_inventory
read_locations
read_metaobject_definitions, write_metaobject_definitions
read_metaobjects, write_metaobjects
```

### Storefront API scopes

Under **Configuration → Storefront API integration**, enable:

```
unauthenticated_read_product_listings
unauthenticated_read_product_inventory
unauthenticated_read_metaobjects
```

> **`unauthenticated_read_product_inventory` is not optional here.** Without
> it `quantityAvailable` returns null, and the stock-aware size filter — the
> thing that makes this storefront different — degrades to a plain
> in-stock/sold-out flag with no low-stock states.
>
> **`unauthenticated_read_metaobjects`** is what lets the storefront read size
> charts. Without it the size guide silently disappears.

Then **Install app**, and reveal the two tokens.

## 3. Fill in `.env`

```bash
cp .env.example .env
```

| Variable | Where it comes from | Secret? |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` | No |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API access token | No — designed to be public |
| `SHOPIFY_ADMIN_TOKEN` | Admin API access token, starts `shpat_` | **Yes** |
| `SHOPIFY_API_VERSION` | `2026-07` | No |

The two tokens are not interchangeable. The Admin token grants read/write over
the whole store, so [`src/lib/env.ts`](../src/lib/env.ts) throws if it finds
one in the storefront slot rather than letting it reach a browser.

## 4. Run the scripts

```bash
npm run shopify:setup
npm run shopify:seed
npm run shopify:doctor
npm run dev
```

Preview the seed first if you like — it needs no credentials:

```bash
npm run shopify:seed -- --dry
```

The collection page shows a `Data source: shopify | sample` badge in dev, so
you can tell at a glance whether you are looking at live data.

---

## The one thing you must verify

Custom `fit.*` and `spec.*` identifiers are ours, so they are correct by
construction. **Category metafield identifiers are Shopify's**, generated from
the Standard Product Taxonomy, and the exact namespace/key strings are not
reliably documented. The values in
[`src/data/shopify/identifiers.ts`](../src/data/shopify/identifiers.ts) are the
expected convention — an informed guess, not verified fact.

`npm run shopify:doctor` prints the real definitions on your store and flags
mismatches. Correct `identifiers.ts` against that output.

A wrong key does not error. It yields null — so the symptom is a missing
filter, not a crash. Check it rather than assuming.

---

## Known limits

- **`shopify:seed` has not been run against a live store.** It was written
  from the Admin API reference; testing needs credentials only you have. Every
  mutation reports its `userErrors`, so failures are diagnosable. If it fights
  you, import [`styles.csv`](styles.csv) and [`variants.csv`](variants.csv)
  with Shopify's own CSV importer instead — a better-trodden path — then run
  `shopify:setup` and fill metafields in admin.
- **Category metafields are not seeded.** They are taxonomy-backed and picked
  from lists rather than typed. Set the product category in admin, then fill
  them.
- **No images.** `Garment.astro` draws placeholder SVG. Replace it with real
  photography — 2048px masters, responsive `srcset`, AVIF/WebP.
- **No reviews.** Reviews with fit data come from a reviews platform. The
  Shopify source returns `reviews: []`, so review blocks render empty against
  live data and populated against sample data. Wire up Okendo or similar next.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Badge says `sample` with a warning | Read failed. The dev server logs the reason. |
| Products load, filters look wrong | Category identifiers mismatched. Run the doctor. |
| Size guide missing | Missing `unauthenticated_read_metaobjects`, or `spec.size_chart` unset. |
| No low-stock states | Missing `unauthenticated_read_product_inventory`. |
| Metafields exist in admin but read as null | Definition access is not `PUBLIC_READ`. The doctor flags this. |
| `HTTP 401/403` | Token belongs to a different store, or scopes not granted. |
