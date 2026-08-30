# Deploying

The site builds to static files. `npm run build` writes `dist/`, and that
directory is the whole site — any file host will serve it.

## Two things to set

**`SITE_URL`** — the address the site will live at. Canonical tags, the
sitemap and the social preview are absolute URLs baked in at build, so this has
to be right *when the build runs*. Changing DNS afterwards does not update
them; you have to rebuild.

**`BASE_PATH`** — only for a GitHub Pages project site, which is served from
`https://user.github.io/repo/` rather than a domain root. Set it to `/repo`.
Leave it unset for a custom domain or any other host.

## GitHub Pages

A workflow is ready at `.github/workflows/pages.yml`. It is **manual only** —
it will not publish anything until you either run it from the Actions tab or
uncomment the `push:` trigger.

To go live:

1. Repository → Settings → Pages → Source: **GitHub Actions**
2. Actions tab → *Deploy to GitHub Pages* → **Run workflow**
3. Once you are happy, uncomment the `push:` block so every push publishes

For a custom domain, add it under Settings → Pages, then delete the
`BASE_PATH` and `SITE_URL` lines from the workflow and set `SITE_URL` to the
domain instead.

## Security headers

The page carries a Content-Security-Policy as a `<meta>` tag, which is the
only mechanism a static host guarantees. GitHub Pages cannot set headers at
all.

On a host that can — Vercel, Netlify, Cloudflare — add these, because two of
them have no meta equivalent:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

`frame-ancestors` is the important one: it is what stops the page being
embedded in someone else's site, and it can only be set as a header.

## What the site ships

**One script**, about 4KB: the eased scrolling in `src/scripts/scroll.ts`.
Momentum scrolling cannot be expressed in CSS, so this is the only thing on
the site that executes. Everything else stays declarative — the mobile menu is
a `<details>`, and every parallax layer and reveal is a CSS scroll timeline.

The policy is `script-src 'self'` with no `'unsafe-inline'` and no
`'unsafe-eval'`, so only that bundled file can run and an injected inline
script still cannot.

One thing to know if you change the build: **Astro inlines small scripts by
default, and an inlined module is blocked by this policy.** The site would
still render and the scrolling would silently stop working. `astro.config.mjs`
sets `assetsInlineLimit: 0` to prevent that; if you ever see the scrolling
stop easing on the deployed site and not locally, check there first.

The script disables itself entirely under `prefers-reduced-motion`, and on
touch devices where the OS already does it better.

Fonts are self-hosted — Cormorant Garamond and Jost, latin and latin-ext only,
184KB total. Nothing is requested from a third party, which also keeps the
site out of scope for consent banners about Google Fonts.

Photographs are resized at build into AVIF, WebP and JPEG at seven widths.
Sources live in `src/assets/photography/` at a 2400px long edge; the retouched
originals they came from are 45MP and should stay out of the repository.
