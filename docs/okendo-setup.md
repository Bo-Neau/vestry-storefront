# Reviews via Okendo

Okendo was chosen in the research for one reason: it collects **structured fit
attributes** — how the garment ran, the reviewer's height, the size they
bought. Around half of apparel shoppers read reviews specifically for size
accuracy, so fit needs to be a queryable field, not prose to dig through.

---

## We fetch server-side, not with their widget

The usual Okendo install drops a JavaScript widget onto the product page. This
project **does not do that**, deliberately.

| | Widget | This integration |
|---|---|---|
| Client JS | Okendo bundle + its dependencies | none |
| Third-party hosts | +1 or more | none at render time |
| Renders in HTML source | no | yes |
| Styling | their theme system | your CSS |

The research teardown found a production apparel page making 500 requests
across 72 third-party hosts, and fashion has the worst Core Web Vitals pass
rate in retail. Reviews are read on nearly every product page, so this is
exactly the place not to add a bundle.

Instead [`okendo.ts`](../src/data/reviews/okendo.ts) calls Okendo's **public
Storefront REST API** on the server and renders reviews into the HTML. The
page stays at zero JavaScript, and reviews are crawlable.

Trade-off: you lose Okendo's write paths — the submit form, media uploads,
"helpful" voting. Collection still happens through Okendo's own post-purchase
emails, so the flow works; you just aren't hosting their write UI. If you need
in-page review submission later, add their widget on a `/write-a-review` route
rather than on every product page.

---

## Setup

### 1. Install Okendo and configure attributes

Install Okendo on the store, then in the Okendo dashboard configure the review
form to capture — as attributes, not free text:

| Attribute | Type | Why |
|---|---|---|
| **Sizing** | centered-range, `Too Small → Just Right → Too Big` | The fit verdict |
| **Height** | single-select bands, e.g. `5'4"–5'6"` | Lets shoppers find a body like theirs |
| **Size purchased** | single-select `XS…XXL` | Makes the fit verdict interpretable |

Without these three, the storefront still renders reviews — but the fit block
that justified choosing Okendo will be empty.

Okendo is a paid app. Dev stores can usually install without billing; confirm
with Okendo if you need an extended trial.

### 2. Find the store id

`OKENDO_USER_ID` is your Okendo store (subscriber) id — **not** the Shopify
store name. It is in Okendo under **Settings → Integrations**, or readable
from the `okendo-reviews` script tag on a live storefront.

It is public and unauthenticated. Not a secret, and not a credential.

### 3. Configure and verify

```bash
echo 'OKENDO_USER_ID=your-okendo-store-id' >> .env
npm run okendo:doctor
```

---

## The two things you must verify

Both are configured per-merchant in the Okendo dashboard, so no integration
can know them in advance. Both live in
[`src/data/reviews/config.ts`](../src/data/reviews/config.ts).

**1. Attribute titles.** We look for `"Sizing"`, `"Fit"`, `"Size"`. If your
form calls it something else, no attribute matches.

**2. The centered-range scale.** We assume `1..5` with `3` centred. It is a
dashboard setting.

Get either wrong and nothing throws — **every review reads "true to size"**,
which looks like working software. That is why `okendo:doctor` exists: it
prints the real attribute titles, observed value ranges, and how each observed
value would be labelled, next to Okendo's own min/mid/max labels so you can
see immediately if the mapping is inverted.

The mapping logic itself is unit-tested:

```bash
npm test
```

11 tests covering scale bounds, the dead zone, inverted-scale detection,
missing attributes, and product-id joining.

---

## How it hangs together

```
loadProducts()                    src/data/source.ts
  → Shopify products (reviews: [])
  → attachReviews()               src/data/reviews/index.ts
      → fetchReviewsByProduct()   src/data/reviews/okendo.ts
      → join on platformId
```

Products from Shopify arrive with `reviews: []` — the commerce API has none to
give. `attachReviews()` fills them in.

Joining uses `Product.platformId` (the raw Shopify gid), normalised to its
numeric tail so a gid and a bare id both match.

One request per 5 minutes covers a small catalogue and serves both per-product
reviews and the aggregates the collection cards need. For a large catalogue,
switch to per-product requests plus Okendo's aggregate endpoint.

**Failure is contained.** A reviews outage logs loudly and renders the page
without reviews. It never takes down the shop — commerce and reviews are
separate concerns and should fail separately.

---

## Known limits

- **Not run against a live Okendo account.** Written from the API reference
  and the documented response shape; verifying needs an Okendo account only
  you have. `okendo:doctor` is the check that closes this gap.
- **No review submission in-page.** See the trade-off above.
- **Sample data keeps its own reviews.** With `OKENDO_USER_ID` unset the
  sample catalogue's hand-written reviews render, so the fit blocks stay
  demonstrable with no account.
- **Aggregates are computed from fetched reviews**, so with more than 100
  reviews the page-one sample skews them. Move to the aggregate endpoint then.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Every review says "true to size" | Attribute title or scale mismatch. Run `okendo:doctor`. |
| Fit verdict inverted | Scale reversed. Compare doctor output to Okendo's min/max labels. |
| Height reads "Not given" | No height attribute on the form, or a title mismatch. |
| Reviews empty, badge says `okendo` | No published reviews, or the product-id join failed. Doctor prints the id format. |
| HTTP 404 from Okendo | `OKENDO_USER_ID` is the Shopify store name, not the Okendo store id. |
