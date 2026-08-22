import type { Size } from "../../data/schema.ts";
import { SIZE_ORDER } from "../../data/schema.ts";
import { MAX_LINES, MAX_QUANTITY_PER_LINE } from "./types.ts";

/**
 * Cart cookie.
 *
 * Two shapes, one cookie:
 *   - Shopify mode stores just the cart id. Shopify holds the truth.
 *   - Sample mode stores compact line references. NEVER prices — those are
 *     recomputed from the catalogue on every render.
 *
 * Format: `v1|<handle>~<colorwayId>~<size>~<qty>|...`
 */
export const CART_COOKIE = "shop_cart";
export const CART_ID_COOKIE = "shop_cart_id";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export interface CookieLine {
  readonly handle: string;
  readonly colorwayId: string;
  readonly size: Size;
  readonly quantity: number;
}

export const cookieOptions = (secure: boolean) => ({
  path: "/",
  httpOnly: true,      // no client JS needs this, so do not expose it
  sameSite: "lax" as const,
  secure,
  maxAge: COOKIE_MAX_AGE,
});

const SAFE = /^[a-zA-Z0-9_-]+$/;

/** Parses defensively: anything malformed is dropped, never thrown. */
export function parseCartCookie(raw: string | undefined): CookieLine[] {
  if (!raw) return [];
  const parts = raw.split("|");
  if (parts.shift() !== "v1") return [];

  const lines: CookieLine[] = [];
  for (const part of parts) {
    if (lines.length >= MAX_LINES) break;
    const [handle, colorwayId, size, qty] = part.split("~");
    if (!handle || !colorwayId || !size || !qty) continue;
    if (!SAFE.test(handle) || !SAFE.test(colorwayId)) continue;

    const matchedSize = SIZE_ORDER.find((s) => s === size);
    if (!matchedSize) continue;

    const quantity = Number.parseInt(qty, 10);
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    lines.push({
      handle,
      colorwayId,
      size: matchedSize,
      quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE),
    });
  }
  return lines;
}

export function serialiseCartCookie(lines: readonly CookieLine[]): string {
  const parts = lines
    .slice(0, MAX_LINES)
    .map((l) => `${l.handle}~${l.colorwayId}~${l.size}~${l.quantity}`);
  return ["v1", ...parts].join("|");
}

/** Stable id for a line, used by update/remove forms. */
export const lineKey = (handle: string, colorwayId: string, size: string): string =>
  `${handle}~${colorwayId}~${size}`;

export function parseLineKey(key: string): CookieLine | null {
  const [handle, colorwayId, size] = key.split("~");
  if (!handle || !colorwayId || !size) return null;
  const matchedSize = SIZE_ORDER.find((s) => s === size);
  if (!matchedSize) return null;
  return { handle, colorwayId, size: matchedSize, quantity: 1 };
}
