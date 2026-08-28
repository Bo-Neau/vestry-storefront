# Editing the journal

Four kinds of thing live in `src/data/`. Nothing here needs a build step you
have to remember — save the file, and the dev server reloads.

## Add a photograph

1. Drop the file into `src/assets/photography/`.
2. Reference it from a piece as `/photography/your-file.jpg`.

The path in the data keeps the `/photography/` prefix even though the file now
lives under `src/` — the resolver matches on the filename. Files must be under
`src/` rather than `public/`, because that is what lets Astro resize them; a
photograph in `public/` is shipped untouched at full size.

Run `npm test` after adding one. There is a test that fails if the data
references a file that does not exist, and another that fails if a photograph
has no alt text or no dimensions.

## Add a piece

Append to `DESIGNS` in `src/data/designs.ts`. Required: `id`, `handle`,
`title`, `designer`, `collection`, `category`, `shape`, `colourName`, `hex`,
`summary`, `description`, `fabric`, `features`, `details`, `images`.

- `handle` becomes the URL: `/pieces/<handle>`.
- `collection` must match a collection `title` exactly, or the piece will not
  appear on any collection page.
- `designer` must match a name in `src/data/people.ts`, or the credit will not
  link to a profile.

## Add a collection

Append to `COLLECTIONS` in `src/data/collections.ts`. The order of the array is
the order readers see, and `eyebrow` is what labels it ("Issue seven").

`lead` is the handle of the piece whose photograph represents the collection.

## Add or edit a person

`src/data/people.ts`. The `slug` becomes the URL: `/designers/<slug>`.

`bio` and `role` are optional. Profile pages are built to read properly with no
biography at all, so adding one improves a page rather than fixing it. Nothing
here is invented — if a bio is missing it is because nobody has written it.

## What is deliberately absent

No prices, no stock, no sizes, no fabric weights, no model measurements and no
care instructions. The storefront carried all of those and every number in them
was made up to make the page look finished. Prose can be corrected by the
client; a number that reads as a measured fact cannot.

If the shop comes back, those fields come back with real data behind them.
