/**
 * Brand configuration.
 *
 * THIS IS THE ONLY FILE YOU EDIT TO REBRAND. Name, voice and the house line
 * live here and are read everywhere else.
 *
 * The shipping, returns and free-delivery copy that used to live below went
 * with the shop. Nothing here quotes a price or makes a delivery promise any
 * more, which is the honest state of the site.
 *
 * Colours and typefaces live in src/styles/tokens.css.
 */

export const BRAND = {
  /** Shown in the header, page titles, Open Graph and structured data. */
  name: "Manussa",

  /** Legal entity, if it differs. Used in policy copy. */
  legalName: "Auracore Company",

  /** The brand's own line, from the booklet. */
  tagline: "Art You Can Wear",

  /** Meta description for the homepage, and the fallback elsewhere. */
  description:
    "Myanmar-based designer clothing where fashion and art meet. Hand-painted " +
    "textiles, hand-worked embroidery and traditional silhouettes reimagined. " +
    "Every piece is credited to the designer who cut it and, where the cloth " +
    "was painted, to the painter.",

  /** Supporting paragraph under the hero. */
  intro:
    "Timeless silhouettes infused with artistic essence and the heritage of " +
    "Myanmar. Every garment and stitch carries an origin, an intention and a " +
    "story, realised in cloth — and every piece names the hand that made it.",

  /** Season or campaign label above the hero. Set to null to hide. */
  eyebrow: "The Hope Collection",
} as const;

/**
 * Commercial terms.
 *
 * Amounts are in minor units (cents), matching Money throughout the codebase.
 */

export const pageTitle = (...parts: string[]): string =>
  [...parts, BRAND.name].filter(Boolean).join(" — ");
