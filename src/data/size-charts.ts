import type { SizeChart } from "./schema.ts";

/**
 * Shopify metaobjects: authored once, referenced by many products.
 * Measurements are GARMENT laid flat, not body — the page says so
 * explicitly, because conflating the two is a top return cause.
 */
export const SIZE_CHARTS: readonly SizeChart[] = [
  {
    id: "chart-tops",
    name: "Tops — garment measurements",
    rows: [
      { size: "XS", chestCm: 96,  waistCm: 92,  lengthCm: 66 },
      { size: "S",  chestCm: 102, waistCm: 98,  lengthCm: 68 },
      { size: "M",  chestCm: 108, waistCm: 104, lengthCm: 70 },
      { size: "L",  chestCm: 114, waistCm: 110, lengthCm: 72 },
      { size: "XL", chestCm: 122, waistCm: 118, lengthCm: 74 },
      { size: "XXL",chestCm: 130, waistCm: 126, lengthCm: 76 },
    ],
    howToMeasure: [
      { part: "Chest", instruction: "Lay the garment flat. Measure across the body one inch below the armhole, then double it." },
      { part: "Waist", instruction: "Measure across the narrowest point of the body, then double it." },
      { part: "Length", instruction: "Measure from the highest point of the shoulder straight down to the hem." },
    ],
  },
  {
    id: "chart-knitwear",
    name: "Knitwear — garment measurements",
    rows: [
      { size: "XS", chestCm: 100, waistCm: 96,  lengthCm: 64 },
      { size: "S",  chestCm: 106, waistCm: 102, lengthCm: 66 },
      { size: "M",  chestCm: 112, waistCm: 108, lengthCm: 68 },
      { size: "L",  chestCm: 118, waistCm: 114, lengthCm: 70 },
      { size: "XL", chestCm: 126, waistCm: 122, lengthCm: 72 },
      { size: "XXL",chestCm: 134, waistCm: 130, lengthCm: 74 },
    ],
    howToMeasure: [
      { part: "Chest", instruction: "Lay flat without stretching the rib. Measure one inch below the armhole and double it." },
      { part: "Waist", instruction: "Measure across the narrowest point, unstretched, then double it." },
      { part: "Length", instruction: "Measure from the shoulder seam down to the bottom of the welt." },
    ],
  },
  {
    id: "chart-trousers",
    name: "Trousers — garment measurements",
    rows: [
      { size: "XS", chestCm: 0, waistCm: 74,  lengthCm: 100 },
      { size: "S",  chestCm: 0, waistCm: 79,  lengthCm: 102 },
      { size: "M",  chestCm: 0, waistCm: 84,  lengthCm: 104 },
      { size: "L",  chestCm: 0, waistCm: 90,  lengthCm: 106 },
      { size: "XL", chestCm: 0, waistCm: 97,  lengthCm: 108 },
      { size: "XXL",chestCm: 0, waistCm: 104, lengthCm: 110 },
    ],
    howToMeasure: [
      { part: "Waist", instruction: "Fasten the trouser and lay it flat. Measure across the top of the waistband and double it." },
      { part: "Inseam", instruction: "Measure from the crotch seam down the inside leg to the hem." },
      { part: "Length", instruction: "Measure from the top of the waistband to the hem along the outside leg." },
    ],
  },
];

export function sizeChartById(id: string): SizeChart {
  const found = SIZE_CHARTS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown size chart: ${id}`);
  return found;
}
