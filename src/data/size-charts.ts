import type { SizeChart } from "./schema.ts";

/**
 * Size charts, as metaobjects would be in Shopify: authored once, referenced
 * by many products.
 *
 * Garment measurements taken flat, never body measurements — the page states
 * which, because conflating them is itself a return driver. For made-to-order
 * pieces these are the base sample measurements before fitting.
 */
export const SIZE_CHARTS: readonly SizeChart[] = [
  {
    id: "chart-tops",
    name: "Tops and outerwear — garment measurements",
    rows: [
      { size: "XS", chestCm: 84,  waistCm: 68,  lengthCm: 52 },
      { size: "S",  chestCm: 88,  waistCm: 72,  lengthCm: 54 },
      { size: "M",  chestCm: 94,  waistCm: 78,  lengthCm: 56 },
      { size: "L",  chestCm: 100, waistCm: 84,  lengthCm: 58 },
      { size: "XL", chestCm: 108, waistCm: 92,  lengthCm: 60 },
      { size: "XXL",chestCm: 116, waistCm: 100, lengthCm: 62 },
    ],
    howToMeasure: [
      { part: "Bust", instruction: "Lay the piece flat and fastened. Measure across the fullest point, then double it." },
      { part: "Waist", instruction: "Measure across the narrowest point of the body, then double it. On peplum styles this sits above the flare." },
      { part: "Length", instruction: "Measure from the highest shoulder point straight down to the hem, excluding any peplum." },
    ],
  },
  {
    id: "chart-skirts",
    name: "Skirts — garment measurements",
    rows: [
      { size: "XS", chestCm: 0, waistCm: 64,  lengthCm: 74 },
      { size: "S",  chestCm: 0, waistCm: 68,  lengthCm: 76 },
      { size: "M",  chestCm: 0, waistCm: 74,  lengthCm: 78 },
      { size: "L",  chestCm: 0, waistCm: 80,  lengthCm: 80 },
      { size: "XL", chestCm: 0, waistCm: 88,  lengthCm: 82 },
      { size: "XXL",chestCm: 0, waistCm: 96,  lengthCm: 84 },
    ],
    howToMeasure: [
      { part: "Waist", instruction: "Fasten the skirt and lay it flat. Measure across the top of the waistband and double it." },
      { part: "Hip", instruction: "Measure across 20cm below the waistband and double it. Fluted styles fall away below this point." },
      { part: "Length", instruction: "Measure from the top of the waistband to the hem at the centre back." },
    ],
  },
  {
    id: "chart-dresses",
    name: "Dresses — garment measurements",
    rows: [
      { size: "XS", chestCm: 84,  waistCm: 66,  lengthCm: 148 },
      { size: "S",  chestCm: 88,  waistCm: 70,  lengthCm: 150 },
      { size: "M",  chestCm: 94,  waistCm: 76,  lengthCm: 152 },
      { size: "L",  chestCm: 100, waistCm: 82,  lengthCm: 154 },
      { size: "XL", chestCm: 108, waistCm: 90,  lengthCm: 156 },
      { size: "XXL",chestCm: 116, waistCm: 98,  lengthCm: 158 },
    ],
    howToMeasure: [
      { part: "Bust", instruction: "Lay flat. Measure across the fullest point of the bodice, then double it." },
      { part: "Waist", instruction: "Measure across the narrowest point, then double it." },
      { part: "Length", instruction: "Measure from the highest shoulder point to the hem. Column styles are cut to sit on the floor with a heel." },
    ],
  },
];

export function sizeChartById(id: string): SizeChart {
  const found = SIZE_CHARTS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown size chart: ${id}`);
  return found;
}
