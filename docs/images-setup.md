# Images

Fashion has the worst Core Web Vitals pass rate in retail (~47–50%), and
images are why. Farfetch measured a **1.3% conversion gain per 100ms of LCP
improvement**, and on a clothing site the LCP element is almost always the
first product photo.

## Default: the platform CDN

`IMAGE_PROVIDER` defaults to `shopify`. Shopify's CDN already holds the
images, resizes and re-encodes on the fly, and adds no third-party host.

Reach for Cloudinary or imgix only when you need something they give you:
DAM workflows across a team, deep zoom, 360 spins. Adding a host to serve
images you are already being served is a poor trade.

```bash
IMAGE_PROVIDER=shopify              # default
IMAGE_PROVIDER=cloudinary
IMAGE_ACCOUNT=your-cloud-name
IMAGE_PROVIDER=imgix
IMAGE_ACCOUNT=your-subdomain
```

Swapping changes [`provider.ts`](../src/lib/images/provider.ts) and nothing
else.

## What the component does

[`ProductImage.astro`](../src/components/ProductImage.astro) renders real
photography when it exists and the generated placeholder when it does not — so
the storefront works before a shoot is booked, and needs **no code change**
afterwards. Attach images to a colourway and they appear.

Three things it gets right, none of them decoration:

**Explicit `width`/`height` on every image.** Without intrinsic dimensions the
browser cannot reserve space, and the grid reflows as each image arrives. On a
product grid that is a page that jumps under the shopper's finger as they
reach for a card. Measured CLS on the product page: **0**.

**A `sizes` attribute describing the slot, not the file.** Getting this wrong
is the most common cause of a slow collection page — without it browsers
assume `100vw` and fetch a 1200px file for a 180px grid cell. The srcset
starts at 200px for exactly that reason.

**One `fetchpriority="high"` image per page.** The first gallery image is the
LCP candidate; it loads eagerly at high priority. Everything else is lazy.
Product cards never get priority — a grid of eager images is how a collection
page gets slow.

## Two rules the provider layer enforces

Both of these were bugs, found by rendering the component rather than trusting
the types. Both now have regression tests.

**1. A CDN can only transform images it hosts.** A local `/sample/x.png` was
being rewritten to `https://cdn.shopify.com/sample/x.png`, which 404s.
Relative paths and foreign hosts now pass through untouched.

**2. Never advertise a transform you cannot perform.** With a
non-transformable source the component still emitted a six-width srcset and
`<source type="image/avif">` for a single PNG — telling the browser there were
six sizes when there was one, and that a PNG was AVIF. `canTransform()` now
gates this: transformable sources get a `<picture>` with AVIF/WebP sources,
everything else gets a plain `<img>`.

## Adding real photography

```ts
{
  id: "tee1-white",
  name: "Chalk",
  hex: "#F2F0EA",
  sizes: stock(6, 14, 4, 11, 5, 2),
  images: [
    { src: "https://cdn.shopify.com/s/files/.../front.jpg",
      alt: "The Everyday Crew in Chalk, front view",
      width: 2048, height: 2662, view: "front" },
  ],
}
```

From Shopify, `src` comes back as an absolute `cdn.shopify.com` URL and
transforms apply automatically.

`width` and `height` are **required by the type**, not optional. They are the
CLS fix, and making them optional is how CLS creeps back in.

## Shoot requirements

| | |
|---|---|
| Master size | 2048px on the long edge — enough for zoom and retina |
| Views | front, back, laid flat, **fabric macro** |
| Ratio | 400:520 (matches the placeholder, so swapping changes no layout) |
| Recorded per shot | **Model height and the size worn** |

That last row is not a photography note, it is the highest-value data on the
product page, and it cannot be recovered afterwards without reshooting. Put it
on the shoot checklist before the first shoot, not after.

## Known limits

- **No zoom UI.** Masters are large enough; the interaction is not built.
- **No art direction per breakpoint.** One crop at all sizes. If mobile needs
  a tighter crop, add a `<source media="...">` branch.
- **No blur-up placeholder.** With explicit dimensions and a background there
  is no layout shift, so the gain would be aesthetic.
- **Sample images are generated PNGs**, not photographs.
