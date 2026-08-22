import { storefront } from "../../data/shopify/client.ts";
import type { Cart, CartLine } from "./types.ts";
import type { Product, Size } from "../../data/schema.ts";
import { SIZE_ORDER } from "../../data/schema.ts";

/**
 * Shopify Cart API.
 *
 * Shopify owns the cart, and critically owns CHECKOUT: payment, tax, fraud
 * screening and PCI scope all stay on their side of the line. We hold a cart
 * id and hand the shopper a `checkoutUrl`. No card data ever reaches this app,
 * which is the single most valuable property of the whole arrangement.
 */

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
          product { handle title }
        }
      }
    }
  }
`;

const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }
`;

const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        quantityAvailable: number | null;
        selectedOptions: { name: string; value: string }[];
        price: { amount: string; currencyCode: string };
        product: { handle: string; title: string };
      };
    }[];
  };
}

const option = (opts: { name: string; value: string }[], want: string): string =>
  opts.find((o) => o.name.toLowerCase() === want.toLowerCase())?.value ?? "";

function mapCart(raw: RawCart, products: readonly Product[]): Cart {
  const byHandle = new Map(products.map((p) => [p.handle, p]));

  const lines: CartLine[] = raw.lines.nodes.map((node) => {
    const m = node.merchandise;
    const colourName = option(m.selectedOptions, "Colour")
      || option(m.selectedOptions, "Color");
    const sizeRaw = option(m.selectedOptions, "Size");
    const size = (SIZE_ORDER.find((s) => s === sizeRaw) ?? "M") as Size;

    const product = byHandle.get(m.product.handle);
    const colorway = product?.colorways.find((c) => c.name === colourName);
    const image = colorway?.images?.find((i) => i.view === "front");
    const unit = Math.round(Number.parseFloat(m.price.amount) * 100);

    return {
      // Shopify's line id — required by update/remove mutations.
      id: node.id,
      handle: m.product.handle,
      colorwayId: colorway?.id ?? colourName,
      size,
      quantity: node.quantity,
      title: m.product.title,
      colorName: colourName,
      unitPrice: { amount: unit, currency: "USD" },
      linePrice: { amount: unit * node.quantity, currency: "USD" },
      imageSrc: image?.src,
      imageAlt: image?.alt,
      hex: colorway?.hex ?? "#B4B4AE",
      hexAlt: colorway?.hexAlt,
      shape: product?.shape ?? "tee",
      available: m.quantityAvailable ?? 0,
    };
  });

  return {
    lines,
    itemCount: raw.totalQuantity,
    subtotal: {
      amount: Math.round(Number.parseFloat(raw.cost.subtotalAmount.amount) * 100),
      currency: "USD",
    },
    checkoutUrl: raw.checkoutUrl,
    backend: "shopify",
  };
}

function firstError(payload: { userErrors?: { message: string }[] } | undefined): string | null {
  const e = payload?.userErrors?.[0];
  return e ? e.message : null;
}

export async function fetchCart(
  cartId: string, products: readonly Product[],
): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(CART_QUERY, { id: cartId });
  // A cart id can expire or be completed; treat that as "no cart", not an error.
  return data.cart ? mapCart(data.cart, products) : null;
}

export async function createCart(
  variantId: string, quantity: number, products: readonly Product[],
): Promise<{ cart: Cart; cartId: string }> {
  const data = await storefront<{
    cartCreate: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity }] });

  const err = firstError(data.cartCreate);
  if (err || !data.cartCreate.cart) throw new Error(err ?? "Could not create cart");
  return { cart: mapCart(data.cartCreate.cart, products), cartId: data.cartCreate.cart.id };
}

export async function addToCart(
  cartId: string, variantId: string, quantity: number, products: readonly Product[],
): Promise<Cart> {
  const data = await storefront<{
    cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(CART_LINES_ADD, { cartId, lines: [{ merchandiseId: variantId, quantity }] });

  const err = firstError(data.cartLinesAdd);
  if (err || !data.cartLinesAdd.cart) throw new Error(err ?? "Could not add to cart");
  return mapCart(data.cartLinesAdd.cart, products);
}

export async function updateCartLine(
  cartId: string, lineId: string, quantity: number, products: readonly Product[],
): Promise<Cart> {
  const data = await storefront<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(CART_LINES_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });

  const err = firstError(data.cartLinesUpdate);
  if (err || !data.cartLinesUpdate.cart) throw new Error(err ?? "Could not update cart");
  return mapCart(data.cartLinesUpdate.cart, products);
}

export async function removeCartLine(
  cartId: string, lineId: string, products: readonly Product[],
): Promise<Cart> {
  const data = await storefront<{
    cartLinesRemove: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });

  const err = firstError(data.cartLinesRemove);
  if (err || !data.cartLinesRemove.cart) throw new Error(err ?? "Could not remove line");
  return mapCart(data.cartLinesRemove.cart, products);
}
