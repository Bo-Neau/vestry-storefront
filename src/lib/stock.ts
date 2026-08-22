import type { Colorway, Size } from "../data/schema.ts";

export const LOW_STOCK_THRESHOLD = 3;

export type StockState = "in" | "low" | "out";

export function stockStateFor(colorway: Colorway, size: Size): StockState {
  const row = colorway.sizes.find((s) => s.size === size);
  const n = row ? row.inventory : 0;
  if (n <= 0) return "out";
  if (n <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

export function stockLabel(state: StockState): string {
  if (state === "out") return "Sold out";
  if (state === "low") return "Low stock";
  return "In stock";
}
