# Deploying

## GitHub Pages will not work

This is a **server-rendered** app. GitHub Pages serves static files only, so
on Pages the cart, the filters, stock accuracy and the 404 handling would all
break.

GitHub hosts the *code*. Something that runs Node hosts the *site*.

## Vercel (configured)

The repo is set up for it. `astro.config.mjs` picks the Vercel adapter when
`VERCEL=1` is present in the build environment and a standalone Node server
otherwise, so local builds are unaffected.

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo
2. Framework preset: **Astro** (auto-detected)
3. Add environment variables — see below
4. **Deploy**

Preview deployments are created per branch automatically, which is a
convenient way to show a client a change before it goes live.

### Environment variables

None are required. With nothing set, the site runs on the sample catalogue —
which is exactly what you want for a demo.

**`SITE_URL` is not needed on Vercel.** The config reads
`VERCEL_PROJECT_PRODUCTION_URL`, which Vercel injects automatically, so
canonical tags, Open Graph URLs and the sitemap all resolve to the real
deployment. Set `SITE_URL` only when moving to a custom domain.

`site` is resolved at BUILD time, not per request — so after adding a custom
domain you must redeploy, not just change the DNS.

### Preview deployments

Vercel gives every branch its own URL. Those are real and reachable, so
anything not `VERCEL_ENV=production` is marked `noindex` and its robots.txt
disallows everything. A client-review branch cannot end up in search results
competing with the live site.

Add them as you connect each service:

| Variable | Needed for | Secret |
|---|---|---|
| `SITE_URL` | Correct canonical/OG/sitemap URLs | No |
| `SHOPIFY_STORE_DOMAIN` | Live catalogue and cart | No |
| `SHOPIFY_STOREFRONT_TOKEN` | Live catalogue and cart | No |
| `SHOPIFY_ADMIN_TOKEN` | Setup scripts only — **do not add to the host** | **Yes** |
| `OKENDO_USER_ID` | Reviews | No |
| `TYPESENSE_URL` + `TYPESENSE_SEARCH_KEY` | Search index | No |
| `TYPESENSE_ADMIN_KEY` | Indexing scripts only — **do not add to the host** | **Yes** |

The two admin tokens belong on your machine or in CI, never in the runtime
environment. Nothing the site serves needs them, and putting them there only
widens what a compromise reaches.

## Other Node hosts

Railway, Render, Fly, or any container platform work unchanged — the default
build produces a standalone Node server:

```bash
npm ci && npm run build
node ./dist/server/entry.mjs      # honours PORT and HOST
```

## Add compression

The standalone Node server does **not** gzip or brotli. Put it behind a CDN
or reverse proxy that does. Vercel handles this automatically; a bare Node
host does not.

## Security headers

`src/middleware.ts` sets CSP, HSTS, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` on every
response.

The CSP includes **`script-src 'none'`** in production. The storefront ships
no JavaScript, so nothing legitimate needs to execute — which means an
injected script from a product description or review cannot run. Adding
analytics or a chat widget requires relaxing that line, and it is worth
doing consciously.

## Before a real launch

- [ ] On a custom domain, set `SITE_URL` and **redeploy** — `site` is
      build-time, so a DNS change alone will not update canonical tags
- [ ] Connect Shopify, then run `npm run shopify:doctor`
- [ ] Confirm compression is on
- [ ] Submit `/sitemap.xml` in Google Search Console
- [ ] Analytics — not built; adding it means relaxing the CSP
- [ ] Cookie consent — not built; required in the EU/UK once analytics exists
- [ ] Privacy policy, terms, returns policy pages — not built
- [ ] Screen-reader pass. The build follows WCAG 2.2 AA but has not been
      audited with an actual screen reader
