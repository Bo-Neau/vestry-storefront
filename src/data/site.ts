/* ---------------------------------------------------------------
   Site content.

   Every string below is transcribed from the client's content brief
   (ManussaWebsiteContentBrief-2). Nothing here is invented — where the
   brief left a slot open it is absent rather than filled, and the page
   is built to read correctly without it.

   Editing this file changes the site. No other file carries copy.
   --------------------------------------------------------------- */

export const BRAND = {
  name: "Manussa",
  tagline: "Art You Can Wear",
  parent: "Aura Core Company Ltd",
  concept: "Inspiration from Paintings",
  city: "Yangon, Myanmar",
  email: "info@auracoreofficial.com",
  website: "auracoreofficial.com",
  websiteUrl: "https://auracoreofficial.com",
  description:
    "A Myanmar designer house where fashion and art are experienced as one. " +
    "Five 2026 collections, each born from a painting.",
  blurb:
    "Art You Can Wear. A Myanmar-based designer label where fashion and art " +
    "are experienced as one — a house of Aura Core Company Ltd.",
} as const;

export const TEXWORLD = {
  event: "Texworld Paris",
  context: "Apparel Sourcing",
  hall: "Hall 3",
  booth: "Booth B300",
  dates: "31 Aug – 2 Sep 2026",
  datesLong: "31 August – 2 September 2026",
  /** Machine-readable, for the structured data and the <time> element. */
  start: "2026-08-31",
  end: "2026-09-02",
} as const;

export const NAV = [
  { label: "Collections", href: "#collections" },
  { label: "Art", href: "#artists" },
  { label: "The House", href: "#house" },
  { label: "Visit", href: "#visit" },
] as const;

export const HERO = {
  eyebrow: "A House of Aura Core · Myanmar",
  wordmark: BRAND.name,
  tagline: BRAND.tagline,
  primary: { label: "Explore the Collections", href: "#collections" },
  secondary: { label: "Visit Us at Texworld", href: "#visit" },
  image: "hero-denim-car",
  imageAlt:
    "Two models in white denim from Myanmar's Essence, beside a vintage car at night",
} as const;

export const MANIFESTO = {
  heading: "Where fashion and art are experienced as one.",
  lead:
    "Art is traditionally seen and admired from a distance, rarely worn. " +
    "At Manussa, we blur that boundary.",
  body:
    "We transfer emotion, texture and structure from the canvas to the cloth. " +
    "Every garment and stitch carries an origin, an intention and a story, " +
    "realised in fabric — through hand-painting, textile printing, hand " +
    "embroidery and appliqué, each finished by hand. Our 2026 collections are " +
    "developed under a single concept — Inspiration from Paintings — in " +
    "collaboration with celebrated Myanmar artists.",
  image: "manifesto-paintings",
  imageAlt:
    "Three looks from The Hope Collection photographed in front of the paintings that inspired them",
} as const;

/**
 * One frame in a collection's rail.
 *
 * `wide` marks a landscape shot. In a sideways rail that means a wider card
 * rather than a taller one, so a group shot gets the room it was composed
 * for and a single figure does not. It is set here rather than read from the
 * file because it is a decision about composition, not about pixels.
 */
export interface Plate {
  readonly src: string;
  readonly alt: string;
  readonly wide?: boolean;
}

export interface Collection {
  readonly no: string;
  readonly handle: string;
  readonly name: string;
  readonly tagline: string;
  readonly credit: readonly string[];
  readonly body: string;
  /** The key frame. It pins beside the text while the text passes it. */
  readonly image: string;
  readonly imageAlt: string;
  /**
   * Every other frame from this collection's shoot, in the rail beneath.
   *
   * The shoot produced twenty-seven photographs and the page used to show
   * twelve, with the rest piled into one gallery at the foot of the site.
   * They belong to the collections they were shot for; this is where they go.
   */
  readonly gallery: readonly Plate[];
}

export const COLLECTIONS: readonly Collection[] = [
  {
    no: "01",
    handle: "the-hope-collection",
    name: "The Hope Collection",
    tagline: "Molten emotion, made wearable.",
    credit: [
      "Inspired by “The Hell” · Zaw Win Pe",
      "Designed by Katherine Paing",
      "Hand-painting by Win Min Than",
    ],
    body:
      "Our debut. Rather than resist life's chaos and its darker side, it melts " +
      "the darkness down and lets it flow — finding, in the specks of light " +
      "within, a quiet hope. Cascading hand-painted “drip” motifs are worked " +
      "across capes and shoulders, each finished by hand.",
    image: "hope-capelet-column",
    imageAlt:
      "A hand-painted capelet over a black column gown from The Hope Collection",
    gallery: [
      { src: "hope-capelet-detail", alt: "Detail of the hand-painted drip motif and beading across the shoulder of the capelet" },
      { src: "hope-corset-worn", alt: "The painted corset bodice from The Hope Collection, worn" },
      { src: "hope-corset-mannequin", alt: "The painted corset bodice on the stand, showing the petal peplum" },
      { src: "hope-column-gown", alt: "The column gown on the stand, hand-finished at the hem" },
      { src: "manifesto-paintings", alt: "Three looks from The Hope Collection in front of the paintings they came from", wide: true },
    ],
  },
  {
    no: "02",
    handle: "new-traditional",
    name: "New Traditional",
    tagline: "Heritage, rewritten as one language.",
    credit: [
      "Traditional Myanmar textiles",
      "Genderless collection",
      "Jackets & scarves",
    ],
    body:
      "Heritage cloth, reworn. New Traditional reframes how traditional dress is " +
      "worn — versatile, chic and weatherproof — challenging the divide between " +
      "men's and women's dress with a single, genderless language of patchwork.",
    image: "traditional-three",
    imageAlt:
      "Three models in blue patchwork jackets from New Traditional, in a room with an antique globe",
    gallery: [
      { src: "traditional-jacket", alt: "A blue patchwork jacket from New Traditional, worn open" },
      { src: "traditional-three-alt", alt: "New Traditional photographed from the front, three looks together", wide: true },
      { src: "traditional-seated", alt: "A patchwork coat and scarf from New Traditional, seated", wide: true },
    ],
  },
  {
    no: "03",
    handle: "crimson-drive",
    name: "Crimson Drive",
    tagline: "Crimson energy, surging over the dark.",
    credit: [
      "Inspired by “Red Strings” · Zaw Win Pe",
      "Designed by Katherine Paing",
    ],
    body:
      "A collection about momentum — the will to push through the dark toward the " +
      "things we reach for. Bold crimson lines run over black and white, echoing " +
      "an eagle that fearlessly faces the storm in search of freedom.",
    image: "crimson-painting",
    imageAlt:
      "Models in black and red from Crimson Drive, standing before the red-line painting",
    gallery: [
      { src: "crimson-three", alt: "Three looks from Crimson Drive in black with crimson detailing" },
      { src: "crimson-mens", alt: "The men's look from Crimson Drive, with a crimson panel" },
    ],
  },
  {
    no: "04",
    handle: "myanmars-essence",
    name: "Myanmar's Essence",
    tagline: "Denim is timeless. Art is priceless.",
    credit: [
      "Contemporary denim",
      "Traditional textile & golden thread",
      "Ready-to-wear",
    ],
    body:
      "Denim — the most modern of textiles — in conversation with heritage pattern " +
      "and fine art. Panels of traditional textile are pieced with golden thread, " +
      "finished with the signature melting paintwork spilling from bold, open " +
      "black stitching.",
    image: "essence-pool-table",
    imageAlt:
      "Two models in indigo denim from Myanmar's Essence, at a pool table",
    gallery: [
      { src: "essence-coat-car", alt: "A white denim coat from Myanmar's Essence, worn beside a vintage car" },
      { src: "essence-peplum-steps", alt: "The printed peplum with white trousers, on the steps" },
      { src: "essence-peplum-room", alt: "The printed peplum from Myanmar's Essence, photographed indoors" },
      { src: "hero-denim-car", alt: "White denim from Myanmar's Essence beside a vintage car at night", wide: true },
      { src: "essence-pair-car", alt: "Two white denim looks from Myanmar's Essence at the car", wide: true },
      { src: "essence-jacket-car", alt: "The white denim jacket, showing the melting paintwork at the shoulder", wide: true },
      { src: "essence-coat-open", alt: "The white denim coat from Myanmar's Essence, worn open", wide: true },
    ],
  },
  {
    no: "05",
    handle: "inner-faces",
    name: "Inner Faces",
    tagline: "Elegant yet Powerful.",
    credit: [
      "Inspired by “Hidden Layers” · Zaw Win Pe",
      "Designed by Pan Ywal Oo",
    ],
    body:
      "A limited edition that looks beneath the surface of a person — the calm we " +
      "show the world, and the layered feelings within. A stitched face line-art " +
      "focal point sits at the chest, while layered sleeves and a solid-black " +
      "skirt hold the darkness in elegant, powerful form.",
    image: "inner-faces-front",
    imageAlt:
      "The Inner Faces jacket, front — stitched face line art at the chest with layered sleeves",
    gallery: [
      { src: "inner-faces-angle", alt: "The Inner Faces jacket from the side, showing the layered sleeve" },
      { src: "inner-faces-back", alt: "The Inner Faces jacket from behind, showing the layered sleeve construction" },
    ],
  },
];

export const ART = {
  eyebrow: "The Art Behind the Cloth",
  heading: "In collaboration with Myanmar's artists.",
  body:
    "We work hand in hand with local painters and artisans to open a space where " +
    "art is not only admired, but worn. Our collections begin on canvas — " +
    "including works by the celebrated Myanmar artist Zaw Win Pe — and are " +
    "translated, stitch by stitch, into cloth. From the molten surface of “The " +
    "Hell” to the red currents of “Red Strings” and the tangled figures of " +
    "“Hidden Layers,” each painting brings its own emotion into the wardrobe.",
  names: ["Zaw Win Pe", "Win Min Than", "and the Manussa design team"],
  /*
    The brief asks for the two paintings side by side here — "The Hell" and
    "Hidden Layers". Those files are not in the supplied photography, so the
    section runs on the collection frames that show the work translated into
    cloth. Swapping them in later is a two-line change.
  */
  images: [
    { src: "manifesto-paintings", alt: "Looks from The Hope Collection shown in front of the paintings they came from" },
    { src: "crimson-painting", alt: "Crimson Drive photographed against the red-line painting" },
  ],
} as const;

export const TECHNIQUES = [
  "Hand-painting",
  "Textile printing",
  "Hand embroidery",
  "Beading",
  "Appliqué",
  "Couching",
  "Tailoring",
] as const;

export const HOUSE = {
  heading: "Founded on a shared pursuit of creation.",
  intro:
    "Manussa was founded by three partners drawn from different worlds — art, " +
    "design and industry — bound by a single purpose: to craft contemporary " +
    "designs that honour Myanmar's traditional textiles and hand-worked craft.",
  /*
    No portraits. The brief lists founder headshots as optional and none were
    supplied, so the cards are set as type rather than leaving three empty
    frames — adding a portrait later improves a card instead of filling a hole.
  */
  /*
    The lace gown.

    It is the one photograph in the shoot that is not from a 2026 collection —
    cream lace with coral thread-work and beading, none of the five houses'
    motifs — so it has no rail to sit in. It goes here, where what is being
    shown is the hand rather than the season. If it does belong to a
    collection, move it into that collection's `gallery` and this section
    goes back to type alone.
  */
  image: "lace-gown",
  imageAlt:
    "A cream lace gown with coral thread-work and beading worked across the bodice",
  founders: [
    {
      name: "Chit Su Mon",
      role: "Art Collector / Managing Director",
      body: "Brings the eye of the gallery to the atelier — the artistic vision behind each collection.",
    },
    {
      name: "Katherine Paing",
      role: "Designer / Creative Director",
      body: "Leads design and tailoring, translating art and heritage into refined, contemporary silhouettes.",
    },
    {
      name: "Khin Seinn Nyet Thu",
      role: "Art Lover / Operations Director",
      body: "From a hospitality background, she leads operations and the high-end customer journey.",
    },
  ],
} as const;

export const VISIT = {
  eyebrow: "Find Us",
  heading: "Meet Manussa at Texworld Paris",
  body: "Come see our collections in person.",
  cta: { label: "Get in Touch", href: `mailto:${BRAND.email}` },
  image: "crimson-three",
  imageAlt: "The Crimson Drive group, photographed before the red-line painting",
} as const;

/*
  Social links are listed in the brief by platform but no URLs were supplied,
  so nothing is linked here yet. An empty array renders no icons rather than
  three links to nowhere, which is the failure a trade-show visitor would
  actually notice.
*/
export const SOCIAL: readonly { readonly label: string; readonly href: string }[] = [];

export const FOOTER = {
  explore: [
    { label: "Collections", href: "#collections" },
    { label: "The Art", href: "#artists" },
    { label: "The House", href: "#house" },
    { label: "Visit", href: "#visit" },
  ],
  legal: `© 2026 ${BRAND.name} · ${BRAND.parent}. All rights reserved. · ${BRAND.tagline}`,
} as const;
