import type { Collection } from "./journal.ts";
import { DESIGNS } from "./designs.ts";

/**
 * Collections, presented as issues rather than seasons.
 *
 * This is the structural decision the research argued for: a journal built
 * from chapters reads as finished at any pace, where a reverse-chronological
 * feed advertises how long it has been since the last post. Nothing here
 * carries a date, so nothing here goes stale.
 *
 * The standfirsts describe what is in each collection. They are my words and
 * the client should edit them, but they claim nothing the photographs do not
 * already show — no invented history, no dates, no origin story.
 */
export const COLLECTIONS: readonly Collection[] = [
  {
    handle: "the-hope-collection",
    title: "The Hope Collection",
    eyebrow: "Issue one",
    standfirst: "Painted by hand, one shoulder at a time.",
    description: [
      "The collection the house is built around. Smoke and ink laid across cotton twill and raw silk, taken from Zaw Win Pe's painting and carried down the shoulder until it fades.",
      "Every painted piece is finished individually, so no two fall the same way. The cutting is structural — a shoulder that holds away from the body, a column narrow enough to wear beneath it.",
    ],
    lead: "painted-capelet",
  },
  {
    handle: "limited-collection",
    title: "Limited Collection",
    eyebrow: "Issue two",
    standfirst: "Weeks of bench work for a single jacket.",
    description: [
      "Hand-stitched line art across the face of the cloth, with beading laid into organza sleeves. The work is slow and it shows — this is the piece that takes the longest to leave the atelier.",
    ],
    lead: "elegant-powerful-jacket",
  },
  {
    handle: "crimson-drive",
    title: "Crimson Drive",
    eyebrow: "Issue three",
    standfirst: "Traditional cloth, cut sharp.",
    description: [
      "Tailoring built on traditional woven textile, with crimson piping run through the seams. Cut to be worn to work and kept on afterwards.",
      "The men's jacket sits here too — a mandarin collar, a concealed placket, and an embroidered panel worked by hand.",
    ],
    lead: "crimson-drive-jacket",
  },
  {
    handle: "contemporary",
    title: "Contemporary",
    eyebrow: "Issue four",
    standfirst: "Denim, painted and pieced.",
    description: [
      "Heavy cotton denim treated as a surface to work on rather than a uniform. One jacket carries paintwork left to melt down the body; the other is pieced with traditional panels and gold thread.",
    ],
    lead: "melting-paint-denim-jacket",
  },
  {
    handle: "new-traditional",
    title: "New Traditional",
    eyebrow: "Issue five",
    standfirst: "Old weaves, no gender.",
    description: [
      "A patchwork of traditional weaves cut to a genderless shape, with a dropped shoulder and a weatherproof finish. The oldest cloth in the house, in the least traditional silhouette.",
    ],
    lead: "new-traditional-patchwork-jacket",
  },
  {
    handle: "standard-line",
    title: "Standard Line",
    eyebrow: "Issue six",
    standfirst: "The pieces meant to be worn often.",
    description: [
      "Lighter weights and cleaner lines, for wearing without ceremony. A printed mosaic peplum, and a lace gown embroidered in coral thread.",
    ],
    lead: "coral-embroidered-gown",
  },
];

export const collectionByHandle = (handle: string): Collection | undefined =>
  COLLECTIONS.find((c) => c.handle === handle);

/** Pieces in a collection, in the order they appear in the booklet. */
export const designsIn = (collection: Collection) =>
  DESIGNS.filter((d) => d.collection === collection.title);

/** The collection a piece belongs to, for the breadcrumb on a piece page. */
export const collectionOf = (collectionTitle: string): Collection | undefined =>
  COLLECTIONS.find((c) => c.title === collectionTitle);
