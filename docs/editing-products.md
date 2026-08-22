# Editing products

Two ways, depending on how far along the client is.

| | Spreadsheet | Shopify |
|---|---|---|
| Who edits | Client, in Excel or Sheets | Client, in Shopify admin |
| Publishing | Someone runs a command and pushes | Instant, no deploy |
| Photos | Developer adds them | Client uploads |
| Checkout | Not available | Works |
| Inventory | Typed by hand | Live, real stock |
| Good for | Demos, pitches, pre-launch | Anything real |

**Shopify is the destination.** The spreadsheet path exists so a client can
shape their catalogue before a store exists — and because the sheets match the
metafield spec, that work carries straight over rather than being thrown away.

---

## Spreadsheet path

### The two files

- **`docs/styles.csv`** — one row per style: name, price, fabric, fit, model
  height, size chart
- **`docs/variants.csv`** — one row per colour × size, with stock

Open in Excel, Numbers or Google Sheets. Save as CSV.

### Then

```bash
npm run catalogue:import      # validates and rebuilds the catalogue
npm run dev                   # check it locally
```

Then commit and push — the live site rebuilds automatically.

To validate without writing anything:

```bash
npm run catalogue:import -- --check
```

### It refuses bad data

Nothing is written unless every row passes. Errors name the sheet, the line
and what was expected:

```
styles:2   spec.fit_cut            "Easy" is not allowed — use one of: Slim, Regular, Relaxed, Oversized
styles:3   fit.model_height        is required
variants:2 colour_hex              "white" must be a 6-digit hex colour like #1E1E1C
variants:3 inventory_quantity      -3 is below the minimum of 0
variants:4 handle                  "ghost-product" has no matching row in styles.csv
```

This is deliberate. A bad `fit` value would not crash anything — it would
quietly produce a product that no filter matches, which is far harder to
notice than a failed import.

Warnings do not block, but read them. The common one:

```
variants  everyday-crew / Chalk has no row for M — treated as sold out.
          A missing row and a 0 mean different things; add explicit zeroes.
```

### Rules that matter

**Stock is the size filter.** The site only offers a size if some colour
actually has it. Wrong numbers here produce a wrong filter, which costs more
trust than an out-of-stock badge ever does.

**Give every colour × size a row**, including zeroes. A missing row and a
zero look the same to a shopper but mean different things to whoever maintains
the sheet.

**`spec.fit_cut` must be one of four values** — Slim, Regular, Relaxed,
Oversized. Inventing "boxy" or "easy" means the fit filter never matches that
product.

**Record model height and size worn.** They render the single most useful
line on a product page, and they cannot be recovered later without reshooting.

### Reviews survive an import

Reviews are not in the sheets — in production they come from a reviews
platform. The importer carries existing ones across by handle, so re-importing
does not empty the product pages.

### One caveat

Colourway ids are derived from the product handle and colour name. **Renaming
a colour changes its id**, which invalidates that item in any cart cookie a
shopper is already holding, and breaks old `?color=` links. Harmless before
launch; worth avoiding after.

---

## Shopify path

Once a store is connected the client edits everything in Shopify admin —
products, copy, photos, stock — with no deploy and no developer. Checkout
starts working at the same moment.

Setup: [shopify-setup.md](shopify-setup.md).
Day-to-day guide for their team: [content-guide.md](content-guide.md).

The CSVs map to the same fields, so catalogue work done in the spreadsheet
transfers rather than being redone.
