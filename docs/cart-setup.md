# Cart and checkout

**The cart is ours. Checkout is not.**

Shopify owns checkout — payment capture, tax calculation, fraud screening, and
with them PCI scope. No card data ever reaches this app. That is not a
shortcut; it is the most valuable property of the whole arrangement. Building
a payment path costs $120k–$300k and 4–9 months before it sells a single
shirt, then carries PCI compliance (<$30k/yr small, penalties $500–$500k) for
as long as it exists.

What we own is everything up to the handoff: line items, quantities, stock
validation, and the `checkoutUrl` the shopper is handed.

---

## Zero JavaScript

The whole flow is form POSTs and redirects.

```
PDP form ──POST──> /cart/add ──303──> PDP?added=M
cart form ──POST──> /cart/update ──303──> /cart
```

Post/Redirect/Get means a refresh cannot re-add an item and the back button
behaves. No cart drawer, no optimistic UI, no client state to desync — and no
JavaScript, which keeps the storefront's performance budget intact.

Trade-off: a full page load per cart action. On a fast server that is cheaper
than the JS bundle a drawer would cost. If you later want a drawer, add it as
progressive enhancement over these same endpoints.

---

## Two backends

| | Shopify configured | Not configured |
|---|---|---|
| Cart storage | Shopify Cart API | Cookie |
| Cookie holds | cart id only | compact line references |
| Checkout | live `checkoutUrl` | disabled, with an honest note |

The local cart exists so the storefront is demonstrable without a store. It is
not a fallback you would ship as a checkout — there is nothing to check out
to, and the UI says exactly that rather than faking a flow.

Every Shopify write path falls back to the local cart on failure. Losing a
cart is worse than losing sync.

---

## The security property that matters

**A cookie is client-controlled. It may influence what is in the cart and how
many. It must never influence what it costs.**

The cookie stores only references — `handle~colourway~size~quantity`. Every
price, title and stock figure is resolved from the catalogue at render time.

Tampering with the cookie was tested directly:

```
cookie: v1|not-a-real-product~x~M~5|everyday-crew~tee1-white~M~99999
result: fake product dropped with a warning
        quantity capped at 10
        subtotal recomputed as $380 (= catalogue price x 10)
```

Other guards, all tested:

- **Sold-out variants are re-checked server-side.** The form disables them,
  but a form is client-side and can be replayed. Anything that changes state
  re-validates.
- **Open redirects blocked.** `returnTo` must be a same-origin path.
  `https://evil.example` and `//evil.example` both fall back to `/`.
- **Cookie is `httpOnly`, `sameSite=lax`**, and `secure` on HTTPS. No client
  JS needs it, so it is not exposed.
- **Astro's origin check** rejects a cross-origin POST with 403 (verified).
- **Caps** of 10 per line and 50 lines, applied on parse as well as on write.
- **Handles and colourway ids** are validated against `[a-zA-Z0-9_-]+`, so a
  path-traversal or markup payload never reaches a lookup.

---

## Going live

The cart needs variant ids, which only come from a real store.
`SizeStock.variantId` is populated by the Shopify mapper. With
[docs/shopify-setup.md](shopify-setup.md) complete, add-to-bag creates a real
Shopify cart and the Checkout button becomes a live link to their hosted
checkout.

Nothing else changes. The seam is `src/lib/cart/index.ts`.

---

## What is not built

- **Express wallets** (Apple Pay, Shop Pay, Google Pay). These are where
  mobile conversion is recoverable — mobile abandonment runs ~80% against ~69%
  on desktop, and payment diversity is reported to lift conversion 12–15%.
  Shopify's hosted checkout offers them once enabled on the store, but there
  is no express button on the cart page yet.
- **Discount codes.** Shopify's Cart API supports them; no UI here.
- **Cart notes / gift options.** 78% of benchmarked sites lack gifting; this
  is one of them.
- **Stock reservation.** Nothing is held until checkout completes, so a size
  can sell out between adding and paying. The cart flags over-ordering; it
  cannot prevent the race.
- **Saved carts across devices.** Cookie-scoped, so a cart is per browser.
  Requires customer accounts.
- **Not verified against a live Shopify store.** The Cart API calls are
  written from the reference. The local path is fully exercised.

## Troubleshooting

| Symptom | Cause |
|---|---|
| 403 on add | Cross-origin POST. Astro's origin check is doing its job. |
| Checkout greyed out | No Shopify store connected. Expected in sample mode. |
| Cart empties unexpectedly | Cookie expired (14 days), or products were delisted. |
| "Only N left" blocking checkout | Stock moved since adding. Reduce quantity. |
| Bag count stale | The layout reads the cart per request; check the cookie is being sent. |
