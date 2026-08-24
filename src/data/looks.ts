import type { Product } from "./schema.ts";

/**
 * Styled looks.
 *
 * Outfit-based merchandising outperforms a generic "related products" grid in
 * apparel: it answers "what do I wear this with", which is the question a
 * shopper actually has once she likes a piece.
 *
 * A look is just an ordered list of product handles. Keeping it that thin
 * means a look never holds stale copies of prices or stock — everything is
 * resolved from the catalogue at render.
 */
export interface Look {
  readonly handle: string;
  readonly title: string;
  /** One line, editorial. Shown under the title on the homepage. */
  readonly note: string;
  /** The piece whose image leads the composition. */
  readonly heroHandle: string;
  readonly pieces: readonly string[];
}

export const LOOKS: readonly Look[] = [
  {
    handle: "hope",
    title: "The Hope Collection",
    note: "The painted capelet over an undecorated column — the debut collection's clearest idea, worn plainly.",
    heroHandle: "column-gown",
    pieces: ["column-gown", "painted-capelet"],
  },
  {
    handle: "raw-silk",
    title: "Raw Silk, Head to Hem",
    note: "Bodice and skirt cut from the same bolt, so the undyed silk reads as one piece.",
    heroHandle: "raw-silk-fluted-skirt",
    pieces: ["painted-corset-bodice", "raw-silk-fluted-skirt"],
  },
  {
    handle: "day-to-night",
    title: "Day to Night",
    note: "Traditional textile worked into tailoring that moves from a meeting to a dinner without changing.",
    heroHandle: "crimson-drive-jacket",
    pieces: ["crimson-drive-jacket", "structured-peplum-vest", "mens-panelled-jacket"],
  },
];

export function lookByHandle(handle: string): Look | undefined {
  return LOOKS.find((l) => l.handle === handle);
}

/** Resolves a look's handles to products, dropping any that no longer exist. */
export function piecesFor(look: Look, products: readonly Product[]): Product[] {
  return look.pieces
    .map((h) => products.find((p) => p.handle === h))
    .filter((p): p is Product => p !== undefined);
}

/** Total price of a look, from live catalogue prices. */
export function lookTotal(pieces: readonly Product[]): number {
  return pieces.reduce((sum, p) => sum + p.price.amount, 0);
}
