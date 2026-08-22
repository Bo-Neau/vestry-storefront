import type { Money } from "../data/schema.ts";

/**
 * The ONLY place money becomes a string.
 *
 * Every price, promotion badge and cart total routes through here, so a
 * storefront can never end up showing "3 for $69 USD" next to prices in
 * another currency — a real bug observed on a live production store.
 *
 * When this becomes multi-currency, this file changes and nothing else.
 */
export const STORE_CURRENCY = "USD" as const;
export const STORE_LOCALE = "en-US" as const;

const formatter = new Intl.NumberFormat(STORE_LOCALE, {
  style: "currency",
  currency: STORE_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatMoney(money: Money): string {
  if (money.currency !== STORE_CURRENCY) {
    // Fail loudly in development rather than rendering a mixed-currency page.
    throw new Error(
      `Currency mismatch: got ${money.currency}, storefront is ${STORE_CURRENCY}. ` +
      `Localise the value before rendering, do not mix currencies on one page.`,
    );
  }
  return formatter.format(money.amount / 100);
}

/** Percentage off, rounded down so we never overstate a discount. */
export function discountPercent(price: Money, compareAt: Money): number {
  if (compareAt.amount <= price.amount) return 0;
  return Math.floor(((compareAt.amount - price.amount) / compareAt.amount) * 100);
}
