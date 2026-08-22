# Rebranding for a client

Two files. Nothing else needs touching.

| File | Holds |
|---|---|
| [`src/config/brand.ts`](../src/config/brand.ts) | Name, tagline, copy, shipping terms, returns policy |
| [`src/styles/tokens.css`](../src/styles/tokens.css) | Every colour, typeface and spacing value |

---

## 1. Name and commercial terms

`src/config/brand.ts`:

```ts
export const BRAND = {
  name: "Storefront",                       // header, titles, OG, schema.org
  tagline: "Clothes that tell you how they fit.",
  description: "...",                       // meta description
  intro: "...",                             // homepage hero paragraph
  eyebrow: "Autumn 2026",                   // null to hide
};

export const COMMERCE = {
  freeShippingThreshold: { amount: 7500, currency: "USD" },  // cents
  flatShippingRate:      { amount: 600,  currency: "USD" },
  returnsWindowDays: 30,
  returnsAreFree: true,
  exchangesSupported: true,
};
```

**Amounts are in cents.** `7500` is $75.00. This matches `Money` throughout
the codebase, which avoids float arithmetic on prices.

Every piece of customer-facing copy about shipping and returns is *derived*
from these values — the header banner, the product page policy list, the cart
summary, and the "spend X more for free shipping" prompt. Change the threshold
once and all four update together.

That is not tidiness. Before this file existed the terms were written out in
four templates with the real figure defined in one, which is how a site ends
up promising free shipping over $75 in the header and $50 in the cart. A
shopper who spots that stops trusting the rest of the page.

Setting `exchangesSupported: false` removes the exchange line everywhere
rather than leaving a promise the client cannot keep.

## 2. Colours and type

`src/styles/tokens.css`. Change the light palette at the top and the dark
palette in both the `prefers-color-scheme` and `[data-theme="dark"]` blocks —
all three, or the site looks right in one mode and wrong in the other.

```css
--paper:      #FBFBFA;   /* page background */
--ink:        #1A1A19;   /* body text, buttons, brand mark */
--accent:     #2C3A4F;   /* links and focus rings only */
--in-stock:   #2F6B45;   /* semantic — keep distinct from accent */
--sale:       #98261F;
```

Keep the semantic colours (stock, sale) distinct from the accent. They carry
meaning: a shopper needs to tell "low stock" from "this is a link" without
reading either.

Typefaces are `--sans` and `--mono`. Both are system stacks, so there is no
webfont request and nothing to fall back from. If the client has a brand
typeface, self-host it and add a `@font-face` — do not link a font CDN, the
CSP blocks external hosts by design.

## 3. Social preview

`public/og-default.svg` — the image shown when a link is shared. Update the
wordmark and tagline to match.

## Checklist

- [ ] `BRAND.name`, tagline, description, intro
- [ ] `COMMERCE` — thresholds, returns window, exchanges. **Confirm these
      against what the client actually offers**, do not carry the defaults
      forward
- [ ] `tokens.css` — light and both dark blocks
- [ ] `public/og-default.svg`
- [ ] `public/favicon.svg`
- [ ] `SITE_URL` in the host environment
- [ ] Sample products in `src/data/catalogue.ts` — or connect Shopify and
      they come from the client's own catalogue

## What stays

Layout, filtering behaviour, the fit-confidence patterns, cart flow and
accessibility work are the reusable part. They are the same for every client
because they come from the research, not from a brand.
