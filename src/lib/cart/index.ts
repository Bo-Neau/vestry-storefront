import type { AstroCookies } from "astro";
import type { Product, Size } from "../../data/schema.ts";
import { isShopifyConfigured } from "../env.ts";
import { loadProducts } from "../../data/source.ts";
import {
  CART_COOKIE, CART_ID_COOKIE, cookieOptions,
  parseCartCookie, serialiseCartCookie, lineKey,
} from "./cookie.ts";
import { buildLocalCart, addLine, setQuantity, removeLine } from "./local.ts";
import * as shop from "./shopify.ts";
import { EMPTY_CART, MAX_QUANTITY_PER_LINE } from "./types.ts";
import type { Cart } from "./types.ts";

/**
 * Cart seam.
 *
 * Shopify when configured — it owns the cart and, more importantly, checkout.
 * A cookie-backed local cart otherwise, so the storefront is demonstrable
 * without a store.
 *
 * Every write path falls back to the local cart on failure rather than
 * throwing. Losing a cart is worse than losing sync.
 */

const secure = (url: URL): boolean => url.protocol === "https:";

export interface AddRequest {
  readonly handle: string;
  readonly colorwayId: string;
  readonly size: Size;
  readonly quantity: number;
}

/** Reads the current cart for display. */
export async function readCart(
  cookies: AstroCookies,
  products?: readonly Product[],
): Promise<Cart> {
  const all = products ?? (await loadProducts()).products;

  if (isShopifyConfigured()) {
    const cartId = cookies.get(CART_ID_COOKIE)?.value;
    if (!cartId) return { ...EMPTY_CART, backend: "shopify" };
    try {
      const cart = await shop.fetchCart(cartId, all);
      if (cart) return cart;
      // Expired or completed — clear it rather than showing a dead cart.
      cookies.delete(CART_ID_COOKIE, { path: "/" });
      return { ...EMPTY_CART, backend: "shopify" };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[cart] Shopify read failed:\n  ${message}`);
      return { ...EMPTY_CART, backend: "shopify", warning: `Cart unavailable: ${message}` };
    }
  }

  return buildLocalCart(parseCartCookie(cookies.get(CART_COOKIE)?.value), all);
}

/** Resolves the Shopify variant id for a chosen colourway + size. */
function variantIdFor(
  products: readonly Product[], req: AddRequest,
): string | undefined {
  const product = products.find((p) => p.handle === req.handle);
  const colorway = product?.colorways.find((c) => c.id === req.colorwayId);
  return colorway?.sizes.find((s) => s.size === req.size)?.variantId;
}

/**
 * Validates against live stock before adding.
 *
 * The form already disables sold-out sizes, but a form is client-side and can
 * be replayed. Anything that changes state re-checks server-side.
 */
export function validateAdd(
  products: readonly Product[], req: AddRequest,
): { ok: true } | { ok: false; reason: string } {
  const product = products.find((p) => p.handle === req.handle);
  if (!product) return { ok: false, reason: "That product is no longer available." };

  const colorway = product.colorways.find((c) => c.id === req.colorwayId);
  if (!colorway) return { ok: false, reason: "That colour is no longer available." };

  const stock = colorway.sizes.find((s) => s.size === req.size);
  if (!stock || stock.inventory <= 0) {
    return { ok: false, reason: `${product.title} in ${colorway.name}, size ${req.size} is sold out.` };
  }
  if (req.quantity < 1 || req.quantity > MAX_QUANTITY_PER_LINE) {
    return { ok: false, reason: `Choose between 1 and ${MAX_QUANTITY_PER_LINE}.` };
  }
  return { ok: true };
}

export async function addToCart(
  cookies: AstroCookies, url: URL, req: AddRequest,
): Promise<{ cart: Cart; error?: string }> {
  const { products } = await loadProducts();

  const valid = validateAdd(products, req);
  if (!valid.ok) return { cart: await readCart(cookies, products), error: valid.reason };

  if (isShopifyConfigured()) {
    const variantId = variantIdFor(products, req);
    if (variantId) {
      try {
        const cartId = cookies.get(CART_ID_COOKIE)?.value;
        if (cartId) {
          const cart = await shop.addToCart(cartId, variantId, req.quantity, products);
          return { cart };
        }
        const created = await shop.createCart(variantId, req.quantity, products);
        cookies.set(CART_ID_COOKIE, created.cartId, cookieOptions(secure(url)));
        return { cart: created.cart };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[cart] Shopify add failed, using local cart:\n  ${message}`);
      }
    }
  }

  const lines = addLine(parseCartCookie(cookies.get(CART_COOKIE)?.value), {
    handle: req.handle, colorwayId: req.colorwayId, size: req.size, quantity: req.quantity,
  });
  cookies.set(CART_COOKIE, serialiseCartCookie(lines), cookieOptions(secure(url)));
  return { cart: buildLocalCart(lines, products) };
}

export async function updateLine(
  cookies: AstroCookies, url: URL, id: string, quantity: number,
): Promise<Cart> {
  const { products } = await loadProducts();
  const capped = Math.max(0, Math.min(quantity, MAX_QUANTITY_PER_LINE));

  if (isShopifyConfigured()) {
    const cartId = cookies.get(CART_ID_COOKIE)?.value;
    if (cartId) {
      try {
        return capped === 0
          ? await shop.removeCartLine(cartId, id, products)
          : await shop.updateCartLine(cartId, id, capped, products);
      } catch (error) {
        console.error(`[cart] Shopify update failed:\n  ${String(error)}`);
      }
    }
  }

  const lines = setQuantity(parseCartCookie(cookies.get(CART_COOKIE)?.value), id, capped);
  cookies.set(CART_COOKIE, serialiseCartCookie(lines), cookieOptions(secure(url)));
  return buildLocalCart(lines, products);
}

export async function removeFromCart(
  cookies: AstroCookies, url: URL, id: string,
): Promise<Cart> {
  const { products } = await loadProducts();

  if (isShopifyConfigured()) {
    const cartId = cookies.get(CART_ID_COOKIE)?.value;
    if (cartId) {
      try { return await shop.removeCartLine(cartId, id, products); }
      catch (error) { console.error(`[cart] Shopify remove failed:\n  ${String(error)}`); }
    }
  }

  const lines = removeLine(parseCartCookie(cookies.get(CART_COOKIE)?.value), id);
  cookies.set(CART_COOKIE, serialiseCartCookie(lines), cookieOptions(secure(url)));
  return buildLocalCart(lines, products);
}

export { lineKey };
export type { Cart } from "./types.ts";
