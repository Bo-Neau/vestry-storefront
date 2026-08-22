import type { Money, Size } from "../../data/schema.ts";

/**
 * A line as the shopper sees it.
 *
 * Display fields (title, price, image) are ALWAYS resolved from the catalogue
 * at render time, never read back from the cookie. A cookie is client-
 * controlled: trusting a price from it means anyone can set their own.
 */
export interface CartLine {
  /** Stable id for update/remove. Shopify line id, or a synthetic key. */
  readonly id: string;
  readonly handle: string;
  readonly colorwayId: string;
  readonly size: Size;
  readonly quantity: number;

  readonly title: string;
  readonly colorName: string;
  readonly unitPrice: Money;
  readonly linePrice: Money;
  readonly imageSrc?: string | undefined;
  readonly imageAlt?: string | undefined;
  readonly hex: string;
  readonly hexAlt?: string | undefined;
  readonly shape: string;

  /** Available stock for this variant, so the cart can flag problems. */
  readonly available: number;
}

export interface Cart {
  readonly lines: readonly CartLine[];
  readonly itemCount: number;
  readonly subtotal: Money;
  /**
   * Where "Checkout" goes.
   *
   * On Shopify this is their hosted checkout — payment, tax, fraud and PCI
   * scope all stay with them. Null in sample mode, where there is no checkout
   * to hand off to and the UI says so plainly rather than faking one.
   */
  readonly checkoutUrl: string | null;
  readonly backend: "shopify" | "local";
  readonly warning?: string | undefined;
}

export const EMPTY_CART: Cart = {
  lines: [],
  itemCount: 0,
  subtotal: { amount: 0, currency: "USD" },
  checkoutUrl: null,
  backend: "local",
};

/** Guards against a cookie or form crafted to blow up the cart. */
export const MAX_QUANTITY_PER_LINE = 10;
export const MAX_LINES = 50;
