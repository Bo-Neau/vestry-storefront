# Adding photos and editing product copy

Written for whoever maintains the shop day to day. No code required.

---

## First, which mode is the site in?

The storefront reads from one of two places, and where you edit depends on
which.

| Mode | Where product data lives | Who edits it |
|---|---|---|
| **Sample** (default) | A file in the codebase | Developer only |
| **Shopify** (production) | Your Shopify admin | You |

In development the collection page shows a small dashed badge —
`Data source: sample` or `shopify`. That tells you which mode is active.

**Sample mode is a demo, not a CMS.** Nothing in it is editable without a
developer. Everything below assumes Shopify is connected — see
[shopify-setup.md](shopify-setup.md). Until then, ask your developer.

---

## Adding product photos

### What to shoot

Four shots per colourway:

| Shot | Why it exists |
|---|---|
| **Front, on a model** | The main image, and the one search results show |
| **Back, on a model** | Second most-viewed image on a clothing page |
| **Laid flat** | Shows the true cut without a body changing the shape |
| **Fabric close-up** | Shoppers judge quality from weave and texture |

Specs:

- **2048px on the long edge.** Smaller than this and zoom looks soft.
- **Portrait, roughly 400 × 520 proportions.** Everything is laid out for
  that shape; a square or landscape image will be cropped.
- **Consistent background** across the range, or the grid looks messy.
- JPEG or PNG. The site converts to modern formats automatically — do not
  pre-optimise, you will only lose quality.

### Record this at the shoot

**The model's height, and the size they are wearing.**

Write it down on the day. It cannot be recovered later without reshooting,
and it is the single most useful line on a product page — it turns a photo
into something a shopper can measure themselves against.

### Uploading

1. Shopify admin → **Products** → open the product
2. **Media** section → drag images in
3. Drag to reorder — **the first image is the one shown in the grid**
4. Click an image → **Add alt text**. Describe the garment, not the photo:
   *"Merino Crew Neck in Deep Navy, front view"*, not *"IMG_4821"*.
   Alt text is what a blind shopper hears, and what Google reads.
5. Assign images to the right colour: click an image → **Variants** →
   tick the colours it belongs to. Without this, every colour shows the same
   photo.

Changes appear on the site within a minute or two.

---

## Editing product copy

Shopify admin → **Products** → open the product.

### The main fields

| Field in Shopify | Where it shows | Keep it |
|---|---|---|
| **Title** | Everywhere | Short. "Merino Crew Neck", not "The New Merino Crew Neck For Autumn" |
| **Description** | Product page, under *Description* | 2–4 sentences: what it is, the fabric, how it wears |
| **Short summary** (`spec.summary`) | Product cards and search results | One line, under 120 characters |

### The fit fields — the important ones

Further down the product page, under **Metafields**:

| Field | Example | Why it matters |
|---|---|---|
| **Model height** | `185 cm` | Half of the most valuable line on the page |
| **Model size worn** | `L` | The other half |
| **Runs true to size** | `small` / `true` / `large` | Prints a sizing warning when needed |
| **Cut** | `Slim` / `Regular` / `Relaxed` / `Oversized` | Powers the fit filter |
| **Fabric weight (gsm)** | `180` | Shoppers use it to judge season and opacity |
| **Care instructions** | One step per line | Renders as a list |
| **Size chart** | Pick a shared chart | Never create one per product |

Two rules worth holding to:

**Use only the four Cut values.** Inventing "easy" or "boxy" breaks the fit
filter — a shopper filtering for *Relaxed* will not see that product.

**Setting "runs large" does not lose sales.** It prevents returns. A shopper
who orders the right size keeps it; one who orders wrong sends it back and
often does not reorder.

---

## Stock

The size filter shows **only sizes that are actually in stock**, and it reads
directly from Shopify inventory.

That means: if inventory is wrong in Shopify, the filter is wrong on the site.
Keeping stock accurate is not admin housekeeping here — it is the thing that
stops shoppers filtering to their size and hitting sold-out products.

Sold-out sizes stay visible on the product page with a line through them.
That is deliberate: a shopper needs to know their size exists and is gone,
not be left wondering whether you make it at all.

---

## Reviews

Reviews are **not** edited in Shopify — they live in the reviews platform
(see [okendo-setup.md](okendo-setup.md)). Fit answers reviewers give there
appear on the product page automatically.

Do not delete critical reviews. Visible criticism makes the positive reviews
believable, and a review saying "runs large" saves you a return.

---

## What you cannot change without a developer

- Page layout and design
- Navigation structure
- Which fields exist on a product
- Shipping thresholds and returns copy in the summary panel
- Anything in sample mode

---

## Quick checks before publishing a product

- [ ] Four images, front image first
- [ ] Alt text on each, describing the garment
- [ ] Images assigned to the right colour variants
- [ ] Model height and size worn filled in
- [ ] Cut set to one of the four allowed values
- [ ] Fabric weight filled in
- [ ] Size chart selected
- [ ] Inventory set for every colour and size — including zeroes
