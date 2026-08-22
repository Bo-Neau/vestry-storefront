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
  name: "Storefront",

  /** Legal entity, if it differs. Used in policy copy. */
  legalName: "Storefront Ltd",

  /** One line. Homepage hero heading. */
  tagline: "Clothes that tell you how they fit.",

  /** Meta description for the homepage, and the fallback elsewhere. */
  description:
    "Every product page carries the model's height, the size they wore, and " +
    "garment measurements laid flat — so you can judge fit before it arrives.",

  /** Supporting paragraph under the hero. */
  intro:
    "Every product page carries the model's height, the size they wore, and " +
    "garment measurements laid flat — so you can judge fit before it arrives, " +
    "not after.",

  /** Season or campaign label above the hero. Set to null to hide. */
  eyebrow: "Autumn 2026",
} as const;

/**
 * Commercial terms.
 *
 * Amounts are in minor units (cents), matching Money throughout the codebase.
 */
export const COMMERCE = {
  freeShippingThreshold: { amount: 7500, currency: "USD" } as Money,
  flatShippingRate: { amount: 600, currency: "USD" } as Money,
  returnsWindowDays: 30,
  /** Set false if the client charges for returns — the copy adapts. */
  returnsAreFree: true,
  /** Self-serve exchanges. High leverage in apparel; turn off if unsupported. */
  exchangesSupported: true,
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

export const COPY = {
  /** Thin line in the header. */
  shippingBanner: COMMERCE.returnsAreFree
    ? `Free shipping and returns over ${money(COMMERCE.freeShippingThreshold)}`
    : `Free shipping over ${money(COMMERCE.freeShippingThreshold)}`,

  /** Product page policy list. */
  shippingTerms:
    `Free shipping over ${money(COMMERCE.freeShippingThreshold)}, ` +
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

  /** How far from free shipping. Returns null once the threshold is met. */
  amountToFreeShipping(subtotal: Money): string | null {
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
