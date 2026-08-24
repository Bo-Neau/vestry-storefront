/**
 * Brand and commercial configuration.
 *
 * THIS IS THE ONLY FILE YOU EDIT TO REBRAND. Name, voice, shipping terms and
 * returns policy all live here and are read everywhere else.
 *
 * Commercial terms were previously written out in four separate templates.
 * That is how a site ends up saying "free shipping over $75" in the header
 * and "over $50" in the cart — the numbers drift, a shopper notices, and
 * trust goes with it. Every figure below is stated once and formatted from
 * the same source.
 *
 * Colours and typefaces live in src/styles/tokens.css.
 */
import type { Money } from "../data/schema.ts";

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
    "Every piece lists the model's height, the size worn and garment " +
    "measurements taken flat.",

  /** Supporting paragraph under the hero. */
  intro:
    "Timeless silhouettes infused with artistic essence and the heritage of " +
    "Myanmar. Every garment and stitch carries an origin, an intention and a " +
    "story, realised in cloth — and every page tells you the model's height, " +
    "the size she wore, and the measurements taken flat.",

  /** Season or campaign label above the hero. Set to null to hide. */
  eyebrow: "The Hope Collection",
} as const;

/**
 * Commercial terms.
 *
 * Amounts are in minor units (cents), matching Money throughout the codebase.
 */
export const COMMERCE = {
  /**
   * Zero means free on every order, and the copy says so rather than
   * announcing a threshold of nothing. At these prices a $75 threshold would
   * read as absurd — terms have to match what is being sold.
   */
  freeShippingThreshold: { amount: 0, currency: "USD" } as Money,
  flatShippingRate: { amount: 0, currency: "USD" } as Money,
  /** Shorter than a stocked range: most pieces here are made to order. */
  returnsWindowDays: 14,
  /** Set false if the client charges for returns — the copy adapts. */
  returnsAreFree: true,
  /**
   * Off, because made-to-order pieces are cut to the buyer. Promising a
   * one-step size swap the atelier cannot honour is worse than not offering
   * it — the exchange line disappears everywhere when this is false.
   */
  exchangesSupported: false,
} as const;

/* ---------------- derived copy ---------------- */

/*
 * Rendered from the values above so the numbers can never disagree between
 * the header, the product page and the cart.
 */

const money = (m: Money): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: m.currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(m.amount / 100);

const FREE_ON_EVERYTHING = COMMERCE.freeShippingThreshold.amount <= 0;

export const COPY = {
  /** Thin line in the header. */
  shippingBanner: FREE_ON_EVERYTHING
    ? (COMMERCE.returnsAreFree
        ? "Complimentary shipping and returns worldwide"
        : "Complimentary shipping worldwide")
    : (COMMERCE.returnsAreFree
        ? `Free shipping and returns over ${money(COMMERCE.freeShippingThreshold)}`
        : `Free shipping over ${money(COMMERCE.freeShippingThreshold)}`),

  /** Product page policy list. */
  shippingTerms: FREE_ON_EVERYTHING
    ? "Complimentary insured shipping worldwide"
    : `Free shipping over ${money(COMMERCE.freeShippingThreshold)}, ` +
      `otherwise ${money(COMMERCE.flatShippingRate)} flat`,

  returnsTerms: COMMERCE.returnsAreFree
    ? `Free returns for ${COMMERCE.returnsWindowDays} days, unworn with tags`
    : `Returns accepted for ${COMMERCE.returnsWindowDays} days, unworn with tags`,

  exchangeTerms: "Exchanges are one step — swap size without repurchasing",

  /** Short forms for the cart summary and homepage. */
  returnsShort: COMMERCE.returnsAreFree
    ? `Free returns for ${COMMERCE.returnsWindowDays} days`
    : `${COMMERCE.returnsWindowDays}-day returns`,

  exchangeShort: "Exchanges are one step",

  /** How far from free shipping. Null when free on everything, or once met. */
  amountToFreeShipping(subtotal: Money): string | null {
    if (FREE_ON_EVERYTHING) return null;
    const remaining = COMMERCE.freeShippingThreshold.amount - subtotal.amount;
    if (remaining <= 0) return null;
    return money({ amount: remaining, currency: subtotal.currency });
  },
} as const;

/** Shipping charged on a given subtotal. */
export function shippingFor(subtotal: Money): Money {
  return subtotal.amount >= COMMERCE.freeShippingThreshold.amount
    ? { amount: 0, currency: subtotal.currency }
    : COMMERCE.flatShippingRate;
}

/** Page title. Keeps the separator consistent everywhere. */
export const pageTitle = (...parts: string[]): string =>
  [...parts, BRAND.name].filter(Boolean).join(" — ");
