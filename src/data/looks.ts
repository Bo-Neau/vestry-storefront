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
    handle: "the-column",
    title: "The Column",
    note: "The painted capelet over an undecorated bias column — the collection's clearest idea, worn plainly.",
    heroHandle: "column-gown",
    pieces: ["column-gown", "painted-shoulder-capelet"],
  },
  {
    handle: "raw-silk",
    title: "Raw Silk, Head to Hem",
    note: "Peplum and skirt cut from the same bolt, so the undyed silk reads as one piece.",
    heroHandle: "painted-peplum-top",
    pieces: ["painted-peplum-top", "raw-silk-fluted-skirt"],
  },
  {
    handle: "day-tailoring",
    title: "Day Tailoring",
    note: "The cropped jacket over sculptural tailoring, with the fluted skirt keeping the line narrow.",
    heroHandle: "painted-cropped-jacket",
    pieces: ["painted-cropped-jacket", "structured-peplum-vest", "fluted-column-skirt"],
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
