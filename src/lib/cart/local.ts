import type { Product } from "../../data/schema.ts";
import type { Cart, CartLine } from "./types.ts";
import type { CookieLine } from "./cookie.ts";
import { lineKey } from "./cookie.ts";
import { MAX_QUANTITY_PER_LINE } from "./types.ts";

/**
 * Cart built from cookie references plus the live catalogue.
 *
 * The cookie stores WHAT is in the cart. Everything a shopper sees — price,
 * title, stock — is resolved here, fresh, on every render. So a stale or
 * tampered cookie can misrepresent quantity at worst, never price.
 *
 * This is also what makes the cart self-correcting: if a product is delisted
 * or sells out between visits, the line reflects that instead of silently
 * carrying an old price to checkout.
 */
export function buildLocalCart(
  cookieLines: readonly CookieLine[],
  products: readonly Product[],
): Cart {
  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const lines: CartLine[] = [];
  let subtotal = 0;
  let dropped = 0;

  for (const ref of cookieLines) {
    const product = byHandle.get(ref.handle);
    if (!product) { dropped += 1; continue; }

    const colorway = product.colorways.find((c) => c.id === ref.colorwayId);
    if (!colorway) { dropped += 1; continue; }

    const stock = colorway.sizes.find((s) => s.size === ref.size);
    const available = stock?.inventory ?? 0;

    // Price is authoritative from the catalogue, never from the cookie.
    const unit = product.price.amount;
    const quantity = Math.min(ref.quantity, MAX_QUANTITY_PER_LINE);
    const image = colorway.images?.find((i) => i.view === "front");

    lines.push({
      id: lineKey(product.handle, colorway.id, ref.size),
      handle: product.handle,
      colorwayId: colorway.id,
      size: ref.size,
      quantity,
      title: product.title,
      colorName: colorway.name,
      unitPrice: product.price,
      linePrice: { amount: unit * quantity, currency: product.price.currency },
      imageSrc: image?.src,
      imageAlt: image?.alt,
      hex: colorway.hex,
      hexAlt: colorway.hexAlt,
      shape: product.shape,
      available,
    });
    subtotal += unit * quantity;
  }

  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: { amount: subtotal, currency: "USD" },
    // No checkout to hand off to. The UI says so rather than faking one.
    checkoutUrl: null,
    backend: "local",
    ...(dropped > 0
      ? { warning: `${dropped} item${dropped === 1 ? "" : "s"} no longer available and ${dropped === 1 ? "was" : "were"} removed.` }
      : {}),
  };
}

/** Adds or increments a line, capped. Returns the new cookie lines. */
export function addLine(
  existing: readonly CookieLine[],
  incoming: CookieLine,
): CookieLine[] {
  const next = existing.map((l) => ({ ...l }));
  const match = next.find(
    (l) => l.handle === incoming.handle
      && l.colorwayId === incoming.colorwayId
      && l.size === incoming.size,
  );
  if (match) {
    match.quantity = Math.min(match.quantity + incoming.quantity, MAX_QUANTITY_PER_LINE);
  } else {
    next.push({ ...incoming, quantity: Math.min(incoming.quantity, MAX_QUANTITY_PER_LINE) });
  }
  return next;
}

export function setQuantity(
  existing: readonly CookieLine[],
  key: string,
  quantity: number,
): CookieLine[] {
  if (quantity <= 0) return removeLine(existing, key);
  return existing.map((l) =>
    lineKey(l.handle, l.colorwayId, l.size) === key
      ? { ...l, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) }
      : l,
  );
}

export function removeLine(
  existing: readonly CookieLine[],
  key: string,
): CookieLine[] {
  return existing.filter((l) => lineKey(l.handle, l.colorwayId, l.size) !== key);
}
