# Search index (Typesense)

In-memory filtering is fine for a demo catalogue and is kept as the reference
implementation. At real catalogue size — thousands of variants, faceted on
every page — you need an index.

The reason this integration exists is narrower than "search is fast". It is
that **the size facet has to stay honest**, and that only holds if the index
knows about inventory.

---

## The one thing that matters

The index stores `sizes_in_stock`, computed from real per-size inventory at
index time. It does **not** facet on `sizes_made`.

The research teardown found a live store whose size filter reported all 59
products under every size, because it filtered on "this style is made in M"
rather than "an M is available to buy". The shopper filters to their size,
trusts the result, and hits sold-out item after sold-out item. That is worse
than having no filter, because it spends their trust before it fails.

Two guards keep it that way:

- `sizes_made` is indexed but **`facet: false`**, so the dishonest filter
  cannot be built by accident. A test asserts this.
- `npm run search:doctor` compares indexed counts against both "in stock" and
  "made in", and fails if they have converged.

**This means the index must be rebuilt on inventory change, not just on
product edits.** See *Keeping it fresh* below. An index that is fresh for
products and stale for stock is exactly the bug, reintroduced.

---

## Local development

Typesense runs as a single binary — no Docker needed.

```bash
curl -O https://dl.typesense.org/releases/30.2/typesense-server-30.2-darwin-arm64.tar.gz
tar xzf typesense-server-30.2-darwin-arm64.tar.gz
md5 -q typesense-server   # compare against typesense-server.md5.txt
./typesense-server --data-dir=/tmp/typesense-data --api-key=localdevkey --listen-port=8108
```

Then:

```bash
cat >> .env <<'EOF'
TYPESENSE_URL=http://localhost:8108
TYPESENSE_ADMIN_KEY=localdevkey
TYPESENSE_COLLECTION=products
EOF

npm run search:keys     # mints a search-only key, prints it once
# paste TYPESENSE_SEARCH_KEY into .env
npm run search:index
npm run search:doctor
```

For production, Typesense Cloud starts around $30/month.

---

## Two keys, and why

| Variable | Can | Exposure |
|---|---|---|
| `TYPESENSE_ADMIN_KEY` | create, import, **delete collections** | Secret. Scripts only. |
| `TYPESENSE_SEARCH_KEY` | `documents:search` on the product collection | Safe to expose |

`npm run search:keys` mints the scoped search key. Typesense returns the value
once at creation and never again.

[`typesense.ts`](../src/lib/search/typesense.ts) **throws** if the search key
equals the admin key, the same guard used for Shopify tokens. An admin key on
the read path can drop your index.

Verified: a DELETE with the search-only key returns `401`.

---

## Reindexing is atomic

`search:index` writes into a fresh timestamped collection and only moves the
`products` alias once every document has landed.

```
products_1787369917230   <- new documents go here
products (alias)         -> flips only on success
```

A failed reindex leaves the live index untouched rather than half-empty. For a
stock-aware filter that is the difference between "slightly stale" and "lying
to shoppers".

`--recreate` drops the previous collection after a successful flip. Without it
the old one is kept, so you can flip back.

---

## Keeping it fresh

Reindexing nightly is not enough — stock moves all day.

**Shopify webhooks to subscribe to:**

| Topic | Why |
|---|---|
| `inventory_levels/update` | **The important one.** Stock moved; `sizes_in_stock` may have changed. |
| `products/update` | Attributes, price, or variants changed |
| `products/create`, `products/delete` | Catalogue changed |

Point them at an endpoint that reindexes the affected product. For a small
catalogue a debounced full reindex is simpler and fast enough; the whole
12-style catalogue indexes in well under a second.

If the client's stock only syncs nightly from an ERP, say plainly that
stock-aware size filtering is not in scope, and ship accurate sold-out states
on the product page instead. Do not ship a filter that is right in the morning
and wrong by the afternoon.

---

## How it hangs together

```
collection page
  → queryCatalogue()            src/lib/search/index.ts
      → typesense configured?   → multi_search
      → else, or on failure     → in-memory reference (src/lib/facets.ts)
```

Both paths return the same shape, so `FilterPanel` is backend-agnostic.

**Disjunctive faceting.** Typesense applies every filter before counting
facets, so one query would report count 0 for every unselected option in a
group the shopper already filtered on — the "all my other choices vanished"
bug. The fix is one search per active facet group, each omitting its *own*
filter, sent together via `multi_search`. That reproduces OR-within-group and
AND-across-group with counts that show what you would get if you added an
option.

**Failure is contained.** If Typesense is unreachable the page falls back to
in-memory filtering with a loud server log and a visible dev warning. Verified
by stopping the server mid-session: the page stayed at HTTP 200, still returned
the correct 7 results for `?size=XXL`, and reported `search: memory`.

**Hydration.** The index returns matching handles; cards are hydrated from the
loaded product set. That is only free at this catalogue size. At real scale,
render cards straight from the index document — it already carries everything
a card needs — and stop loading every product.

---

## Verification

```bash
npm run search:doctor
```

Checks four things:

1. Document count matches the source catalogue
2. **Size facets count in-stock, not made-in** — and fails if the data has no
   sold-out sizes, because then the test proves nothing
3. Facet counts match `src/lib/facets.ts` exactly across five filter
   combinations, including OR-within-group and multi-group AND
4. Index freshness and total inventory drift

Verified output on the sample catalogue:

```
✓ XS   7 in stock  (made in 12 — correctly excluding 5)
✓ M    9 in stock  (made in 12 — correctly excluding 3)
✓ size=XXL                     7 results, facets agree
✓ size=S,M (OR within group)   12 results, facets agree
✓ total inventory matches source (846 units)
```

Plus `npm test` — 20 unit tests covering exact-match operators (`:=` so "S"
does not match "XS"), group AND/OR, the `skip` behaviour, and that every
document's `sizes_in_stock` excludes sold-out sizes.

## Known limits

- **Search box not wired.** The index supports `query_by` on title, summary,
  fabric and colours, and `search()` accepts a `query`. There is no search
  input in the UI yet.
- **No typo tolerance tuning, synonyms, or ranking rules.** Defaults only.
- **Aggregates from the index are not used for cards** — ratings still come
  from the product objects.
