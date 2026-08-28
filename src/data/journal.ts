/* ---------------------------------------------------------------
   Journal schema.

   Manussa is not selling yet, so there is no price, no stock and no
   variant here. What remains is what the booklet actually documents:
   who designed a piece, who painted it, what it is made of, and which
   collection it belongs to.

   One deliberate omission. The storefront carried fabric weights in
   gsm, model heights, sizes worn and care instructions — every one of
   those numbers was invented to make the page look complete. Prose can
   be reviewed and corrected by the client; a number that reads as a
   measured fact cannot. So the descriptive copy stays and the false
   precision is gone.
   --------------------------------------------------------------- */

export type Category = "Outerwear" | "Tops" | "Skirts" | "Dresses";

export type GarmentShape = "jacket" | "cape" | "top" | "skirt" | "gown";

/**
 * One photographed view.
 *
 * `width`/`height` are required, not optional. Without intrinsic dimensions
 * the browser cannot reserve space before the image arrives and the page
 * reflows as each one loads. On a page that is mostly photographs, that is
 * the difference between a publication and a slideshow that jumps.
 */
export interface Photograph {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** front | back | flat | detail — drives ordering and the caption. */
  readonly view: "front" | "back" | "flat" | "detail";
}

/**
 * A single piece.
 *
 * `designer` is not optional. The house is a collective and the booklet
 * credits a named designer on almost every page; a piece without a credit
 * misrepresents how the work is made. `artist` is separate because the
 * person who paints a garment is often not the person who cut it.
 */
export interface Design {
  readonly id: string;
  readonly handle: string;
  readonly title: string;
  readonly designer: string;
  readonly artist?: string;
  readonly collection: string;
  readonly category: Category;
  readonly shape: GarmentShape;
  /** The colourway as shown. One per piece — these are not production runs. */
  readonly colourName: string;
  readonly hex: string;
  readonly summary: string;
  readonly description: string;
  readonly fabric: string;
  readonly features: readonly string[];
  readonly details: readonly string[];
  readonly images: readonly Photograph[];
}

/**
 * A person who makes the work.
 *
 * `bio` and `role` are optional and deliberately empty until the client
 * supplies them. The profile page is built to read properly without a bio —
 * the work itself is the substance — so an unwritten biography degrades the
 * page rather than breaking it.
 */
export interface Designer {
  readonly slug: string;
  readonly name: string;
  readonly role?: string;
  readonly bio?: string;
  readonly portrait?: Photograph;
}

/** A collection, presented as an issue rather than a season. */
export interface Collection {
  readonly handle: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly standfirst: string;
  readonly description: readonly string[];
  readonly lead: string;
}

/** URL-safe slug from a person's name. Latin names only, which is all we have. */
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** The lead photograph, preferring a front view, falling back to the first. */
export const leadImage = (design: Design): Photograph | undefined =>
  design.images.find((i) => i.view === "front") ?? design.images[0];

/** Every image after the lead, in view order, for the piece page. */
export const supportingImages = (design: Design): readonly Photograph[] => {
  const lead = leadImage(design);
  return design.images.filter((i) => i !== lead);
};
