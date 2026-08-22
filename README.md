# Vestry — clothing brand reference storefront

A working storefront that implements the conversion patterns from the
research briefs, on a data layer shaped to match Shopify's apparel model.

Two jobs: a starting template for client builds, and a demo you can show in
a pitch.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production server build
npm run check    # astro check — types + template diagnostics
```

## What it demonstrates

Every item below traces to a finding in the research. Numbers are from
Baymard unless noted.

| Implemented | Why |
|---|---|
| Model height + size worn, above the size picker | Highest-value fit line on a clothing PDP. Cheap to show, impossible to backfill without reshooting. |
| Sizes as buttons, sold out struck through not hidden | 57% of leading sites don't use buttons. Hiding absence is more confusing than showing it. |
| **Stock-aware size facets** | The teardown found a live store reporting all 59 products under every size. Here a size counts a style only if a colourway has it to sell. |
| One card per style, colourways as swatches | Stops a 12-style range presenting as 38 near-duplicate cards and splitting SEO. |
| Reviews with height, size bought, ran small/true/large | 48% of apparel shoppers read reviews specifically for size accuracy. |
| Full star distribution, negatives kept | 89% of sites mishandle negative reviews. Warning off the wrong buyer prevents a return. |
| Returns + shipping inline on the PDP | 60% look for it there; 44% of sites omit it. |
| Size guide in a native popover, same page | A guide that opens a new tab is functionally absent on mobile. |
| Garment measurements labelled as garment, not body | Conflating the two is itself a return driver. |
| Always-reachable mobile add-to-bag | Mobile cart abandonment is 79.9% vs 69.2% desktop. |
| Filters in the URL as plain links | Bookmarkable, shareable, crawlable, back-button safe, and needs no JS. |
| One money formatter | The teardown found `3 FOR $69 USD` shown against prices in THB. `formatMoney` throws on a currency mismatch rather than rendering a mixed-currency page. |
| Search index facets on in-stock sizes | `sizes_made` is indexed but `facet: false`, so the dishonest filter cannot be built by accident. |

## Measured

Production build, product page, localhost:

```
3 requests total   0 JS bytes    0 third-party hosts
74.9 KB page       728 DOM nodes
```

For contrast, the live production apparel page profiled in the research made
**500 requests across 72 third-party hosts** with 6,075 DOM nodes. Fashion has
the worst Core Web Vitals pass rate in retail (~47–50%), and Farfetch measured
1.3% conversion gain per 100ms of LCP saved.

Real photography will add weight — that is the point. The budget is reserved
for images, which is where it belongs in this category.

## Architecture

```
src/
  data/
    schema.ts        Types + pure derivations. Mirrors Shopify's model.
    catalogue.ts     Sample data. Replace with API calls.
    size-charts.ts   Shopify metaobjects — one chart, many products.
  lib/
    money.ts         The only place money becomes a string.
    facets.ts        Stock-aware faceting, URL <-> state.
    stock.ts         Per-size stock states.
  components/        Garment (placeholder art), Gallery, SizeGuide,
                     Reviews, ProductCard, FilterPanel
  pages/
    index.astro
    collections/[handle].astro
    products/[handle].astro
```

**Why server-rendered.** A clothing storefront shows live stock. A statically
built page will happily advertise inventory that is gone. Server rendering also
lets filters be plain query params, so faceting costs zero client JS.

**Why no UI framework.** Nothing here needs one. Size selection is radio
inputs, the size guide is `popover`, the gallery is CSS scroll-snap, and the
mobile add-to-bag button uses `form="buy-form"` to submit a form it sits
outside of.

## Swapping in a real backend

`src/data/` is the only layer that knows where products come from. Replace
`catalogue.ts` with Storefront API calls returning the same shapes and no
component changes.

The schema already maps to Shopify:

- `attributes.neckline` / `sleeveLength` / `fabric` / `targetGender` /
  `features` → **predefined** category metafields from Shopify's Standard
  Product Taxonomy. Populate those rather than inventing your own.
- `colorways[].name` and `sizes[].size` → **variant options**, not metafields.
  Connect each option to its category metafield entries — that is what gives
  colour swatches, renaming in one place, and standardised channel values.
- `colorways[]` → variants. Because colour is an option, one product already
  IS one style, so variant grouping is automatic.
- `fit.modelHeightCm` → custom metafield, `dimension` type.
- `fit.modelSizeWorn`, `fit.runsTrueToSize` → custom metafields.
- `sizeChartId` → `metaobject_reference`.

Full specification with every field, type and validation:
**[docs/metafield-spec.md](docs/metafield-spec.md)**.

Setup guide: **[docs/shopify-setup.md](docs/shopify-setup.md)**

Reviews come from a separate provider, not from Shopify — see
**[docs/okendo-setup.md](docs/okendo-setup.md)**. Fetched server-side rather
than via their JS widget, so the page keeps its zero-JS budget.

Search runs through Typesense — see **[docs/search-setup.md](docs/search-setup.md)**.
The index facets on `sizes_in_stock`, computed from real inventory, and
`npm run search:doctor` verifies it against the in-memory reference.

Images run through a provider layer that defaults to the platform CDN — see
**[docs/images-setup.md](docs/images-setup.md)**. Real photography drops in by
attaching `images` to a colourway; no code change.

## Before shipping to a client

- [ ] Attach real photography to colourways — 2048px masters, 4 views
      including a fabric macro. `ProductImage` handles srcset/AVIF/WebP.
- [ ] Point `src/data/` at the real commerce API
- [ ] Add compression — the standalone Node server does **not** gzip. Put it
      behind a CDN or reverse proxy that does
- [ ] Performance budget enforced in CI, and a named owner for new tags
- [ ] Full WCAG 2.2 AA audit with a screen reader. Keyboard paths, focus
      order, and swatch/size labels are built in; verify, don't assume
- [x] Cart — built, zero JS, form POST + redirect. See
      **[docs/cart-setup.md](docs/cart-setup.md)**
- [ ] Checkout, tax, payments, fraud — the bought layer. Do NOT build these.
      Shopify's hosted checkout takes over from `cart.checkoutUrl`.
