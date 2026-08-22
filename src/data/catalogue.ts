import type { Product, Review, Size, SizeStock } from "./schema.ts";

/* ---------------------------------------------------------------------------
 * Sample catalogue.
 *
 * Written from the collection photography: hand-painted pieces where a smoke
 * and ink motif bleeds down from the shoulder, sculptural tailoring in
 * unbleached canvas and raw silk, and a black column gown.
 *
 * Stock is deliberately in single digits. These are atelier pieces, not
 * stocked basics — which is exactly the case where an honest size filter
 * matters most, because almost everything is one or two units from sold out.
 *
 * Regenerate from spreadsheets with: npm run catalogue:import
 * ------------------------------------------------------------------------- */

const usd = (dollars: number) => ({ amount: Math.round(dollars * 100), currency: "USD" as const });

/** Stock per size, in SIZE_ORDER. A 0 means genuinely sold out. */
const stock = (xs: number, s: number, m: number, l: number, xl: number, xxl: number): SizeStock[] => [
  { size: "XS", inventory: xs }, { size: "S", inventory: s },
  { size: "M", inventory: m },   { size: "L", inventory: l },
  { size: "XL", inventory: xl }, { size: "XXL", inventory: xxl },
];

let reviewSeq = 0;
const rev = (
  rating: 1 | 2 | 3 | 4 | 5, title: string, body: string, author: string,
  date: string, heightBand: string, sizePurchased: Size,
  fitFeedback: "small" | "true" | "large",
): Review => ({
  id: `r${++reviewSeq}`, rating, title, body, author,
  verified: true, date, heightBand, sizePurchased, fitFeedback,
});

/* -------------------------------------------------------------------------- */

export const PRODUCTS: readonly Product[] = [
  {
    id: "STYLE-OUT-001",
    handle: "painted-cropped-jacket",
    title: "Painted Cropped Jacket",
    category: "Outerwear",
    shape: "jacket",
    price: usd(1850),
    summary: "Cropped cotton twill, hand-painted at the shoulder in smoke and ink.",
    description:
      "Cut short and square in a dense unbleached cotton twill, then painted by hand across the yoke so the motif runs down over the chest and fades out. Every piece is painted individually, so no two fall the same way. Three-quarter sleeves with a turned cuff, concealed centre-front zip, and a stand collar cut to sit open.",
    attributes: {
      fit: "Sculptural",
      neckline: "Collared",
      sleeveLength: "Three-quarter",
      fabric: "100% cotton twill, hand-painted",
      fabricWeightGsm: 340,
      targetGender: "Women",
      features: ["Hand-painted, no two alike", "Concealed front zip", "Turned cuff", "Stand collar"],
    },
    fit: { modelHeightCm: 178, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "painted-cropped-jacket-unbleached", name: "Unbleached", hex: "#E9E4D7", sizes: stock(1, 2, 2, 1, 0, 0) },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Store on a padded hanger"],
    details: ["Made to order, 4–6 weeks", "Painted in the atelier", "Model wears size S"],
    reviews: [
      rev(5, "The painting is extraordinary", "Photographs do not do the surface justice — there is real depth in the greys, and the motif sits differently on every piece. Mine has more silver through the shoulder than the sample.", "Camille D.", "2026-07-18", "5'7\"–5'9\"", "S", "small"),
      rev(4, "Take a size up", "Cut very close through the shoulder and upper arm. I am usually a small and needed the medium to move properly in it.", "Ines R.", "2026-06-24", "5'4\"–5'6\"", "S", "small"),
      rev(5, "Worth the wait", "Six weeks and worth every one. The cropped line works over everything from a column skirt to wide trousers.", "Beatriz N.", "2026-05-30", "5'10\"–6'0\"", "M", "small"),
    ],
  },

  {
    id: "STYLE-OUT-002",
    handle: "painted-shoulder-capelet",
    title: "Painted Shoulder Capelet",
    category: "Outerwear",
    shape: "cape",
    price: usd(1240),
    summary: "Structured capelet, painted across both shoulders, cut to sit over a column.",
    description:
      "A short structured capelet in the same painted cotton, cut with a firm shoulder line so it holds its shape away from the body. Designed to sit over a narrow column dress without crushing the sleeve. Fastens with a single hook at the throat.",
    attributes: {
      fit: "Sculptural",
      neckline: "Open",
      sleeveLength: "Sleeveless",
      fabric: "100% cotton twill, hand-painted",
      fabricWeightGsm: 340,
      targetGender: "Women",
      features: ["Hand-painted, no two alike", "Structured shoulder", "Single hook closure"],
    },
    fit: { modelHeightCm: 178, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "painted-shoulder-capelet-unbleached", name: "Unbleached", hex: "#E9E4D7", sizes: stock(1, 1, 2, 1, 1, 0) },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Store flat"],
    details: ["Made to order, 4–6 weeks", "Painted in the atelier", "Model wears size S"],
    reviews: [
      rev(5, "Transforms a plain dress", "Wore it over the black column gown for a gallery opening and it was the only thing anyone talked about.", "Mireille A.", "2026-07-02", "5'7\"–5'9\"", "S", "true"),
      rev(4, "Heavier than expected", "It has real weight, which is what makes it hold the shoulder — but it is not something you forget you are wearing.", "Sofia K.", "2026-06-11", "5'4\"–5'6\"", "XS", "true"),
    ],
  },

  {
    id: "STYLE-TOP-001",
    handle: "structured-peplum-vest",
    title: "Structured Peplum Vest",
    category: "Tops",
    shape: "top",
    price: usd(980),
    summary: "Sleeveless wool crepe with a sharp peplum and sculptural buttons.",
    description:
      "Sleeveless and closely fitted through the body, breaking into a short firm peplum at the hip. Cut from a dry wool crepe that holds an edge. The buttons are carved individually in resin and no two are identical — they are the reason the front is otherwise entirely plain.",
    attributes: {
      fit: "Fitted",
      neckline: "Round",
      sleeveLength: "Sleeveless",
      fabric: "98% wool crepe, 2% elastane",
      fabricWeightGsm: 280,
      targetGender: "Women",
      features: ["Carved resin buttons", "Structured peplum", "Fully lined", "Boned side seams"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "structured-peplum-vest-chalk", name: "Chalk", hex: "#EDE9E0", sizes: stock(2, 3, 2, 2, 1, 0) },
      { id: "structured-peplum-vest-ink",   name: "Ink",   hex: "#14130F", sizes: stock(1, 2, 3, 2, 1, 1) },
    ],
    care: ["Dry clean only", "Cool iron on the reverse", "Do not iron the buttons"],
    details: ["Made in the atelier", "Carved resin buttons", "Model wears size S"],
    reviews: [
      rev(5, "The buttons alone", "I bought it for the tailoring and fell in love with the buttons. They catch the light like stone.", "Halima T.", "2026-07-21", "5'4\"–5'6\"", "S", "small"),
      rev(4, "Boned, so size carefully", "The side boning means there is no give at all. Beautiful line once you have the right size, but try it on.", "Renata M.", "2026-06-28", "5'7\"–5'9\"", "M", "small"),
      rev(5, "Wears far beyond evening", "Under a jacket it reads as tailoring; alone it reads as evening. I have worn it to both in a week.", "Cleo B.", "2026-06-05", "5'10\"–6'0\"", "M", "small"),
      rev(3, "The peplum is firm", "Lovely piece but the peplum stands away more than the photographs suggest. Not a soft silhouette.", "Priya S.", "2026-05-14", "5'4\"–5'6\"", "XS", "small"),
    ],
  },

  {
    id: "STYLE-TOP-002",
    handle: "painted-peplum-top",
    title: "Painted Peplum Top",
    category: "Tops",
    shape: "top",
    price: usd(1480),
    summary: "Raw silk with a mandarin collar and the motif painted across the bodice.",
    description:
      "Raw silk in its undyed state, slubbed and matte, cut close through the bodice with a mandarin collar and a concealed front zip. The painting runs across the chest rather than the shoulder here, so it reads as a panel rather than a fall. Short structured peplum.",
    attributes: {
      fit: "Fitted",
      neckline: "Mandarin",
      sleeveLength: "Sleeveless",
      fabric: "100% raw silk, hand-painted",
      fabricWeightGsm: 220,
      targetGender: "Women",
      features: ["Hand-painted, no two alike", "Concealed front zip", "Mandarin collar", "Structured peplum"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "painted-peplum-top-raw-silk", name: "Raw Silk", hex: "#E4DCC8", sizes: stock(1, 2, 2, 1, 0, 0) },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Silk marks with water"],
    details: ["Made to order, 4–6 weeks", "Undyed raw silk", "Model wears size S"],
    reviews: [
      rev(5, "The silk is the point", "Slubbed and completely matte — it holds the paint in a way a smooth silk never would. You can see the weave through the grey.", "Anouk V.", "2026-07-09", "5'7\"–5'9\"", "S", "small"),
      rev(4, "Cut very close", "Fitted in the true sense. I would size up if you want to eat dinner in it.", "Georgia L.", "2026-06-17", "5'4\"–5'6\"", "S", "small"),
      rev(5, "Sold with the skirt", "Bought the matching fluted skirt and the two together are a complete look. The silk matches exactly.", "Nadia F.", "2026-05-22", "5'4\"–5'6\"", "XS", "small"),
    ],
  },

  {
    id: "STYLE-TOP-003",
    handle: "silk-mandarin-blouse",
    title: "Silk Mandarin Blouse",
    category: "Tops",
    shape: "top",
    price: usd(760),
    summary: "Long-sleeve raw silk blouse, unpainted, cut to layer under the painted pieces.",
    description:
      "The quiet piece in the collection. Long sleeves, mandarin collar, no painting — made to sit under the capelet or jacket without competing. Cut slightly looser through the body than the peplum styles so it layers cleanly.",
    attributes: {
      fit: "Tailored",
      neckline: "Mandarin",
      sleeveLength: "Long",
      fabric: "100% raw silk",
      fabricWeightGsm: 180,
      targetGender: "Women",
      features: ["Covered buttons", "Mandarin collar", "Cut to layer"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "M", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "silk-mandarin-blouse-raw-silk", name: "Raw Silk", hex: "#E4DCC8", sizes: stock(2, 3, 4, 3, 2, 1) },
      { id: "silk-mandarin-blouse-ink",      name: "Ink",      hex: "#14130F", sizes: stock(1, 2, 3, 2, 1, 0) },
    ],
    care: ["Dry clean recommended", "Cool iron on the reverse", "Silk marks with water"],
    details: ["Made in the atelier", "Undyed raw silk", "Model wears size M"],
    reviews: [
      rev(5, "The workhorse", "Not the piece you notice in the lookbook, and the one I have worn most. Goes under everything.", "Marta E.", "2026-07-14", "5'7\"–5'9\"", "M", "true"),
      rev(4, "Wrinkles, as raw silk does", "No surprise if you know the fabric. Steams out in a minute.", "Yuki H.", "2026-06-20", "5'4\"–5'6\"", "S", "true"),
    ],
  },

  {
    id: "STYLE-SKIRT-001",
    handle: "fluted-column-skirt",
    title: "Fluted Column Skirt",
    category: "Skirts",
    shape: "skirt",
    price: usd(890),
    summary: "Black wool crepe, narrow to the knee then released into a soft flute.",
    description:
      "Cut narrow through the hip and thigh, then released below the knee into a fluted hem that moves without adding width. Wool crepe with a dry hand so the line stays clean. Concealed side zip, no waistband — the skirt sits directly on the waist.",
    attributes: {
      fit: "Fitted",
      fabric: "98% wool crepe, 2% elastane",
      fabricWeightGsm: 280,
      targetGender: "Women",
      features: ["Fluted hem", "Concealed side zip", "No waistband", "Fully lined"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-skirts",
    colorways: [
      { id: "fluted-column-skirt-ink",   name: "Ink",   hex: "#14130F", sizes: stock(2, 3, 3, 2, 1, 1) },
      { id: "fluted-column-skirt-chalk", name: "Chalk", hex: "#EDE9E0", sizes: stock(0, 2, 2, 1, 0, 0) },
    ],
    care: ["Dry clean only", "Cool iron on the reverse", "Hang to store"],
    details: ["Made in the atelier", "Hem finished by hand", "Model wears size S"],
    reviews: [
      rev(5, "The flute is judged perfectly", "Just enough movement below the knee without becoming a full skirt. Very hard to find.", "Delphine C.", "2026-07-25", "5'4\"–5'6\"", "S", "true"),
      rev(5, "Pairs with the vest", "Bought with the peplum vest and it is a complete suit. The blacks match exactly, which I did not expect.", "Rania O.", "2026-06-30", "5'7\"–5'9\"", "M", "true"),
      rev(4, "No waistband takes adjusting", "Sits directly on the waist, which is lovely but unforgiving if you are between sizes.", "Elke W.", "2026-06-08", "5'4\"–5'6\"", "XS", "true"),
    ],
  },

  {
    id: "STYLE-SKIRT-002",
    handle: "raw-silk-fluted-skirt",
    title: "Raw Silk Fluted Skirt",
    category: "Skirts",
    shape: "skirt",
    price: usd(1150),
    summary: "Floor-length raw silk, cut to match the painted peplum top.",
    description:
      "The same narrow-to-fluted line taken to the floor in undyed raw silk. Cut from the same bolt as the painted peplum top so the two read as one piece. Hem finished by hand and left slightly heavy so it falls straight.",
    attributes: {
      fit: "Draped",
      fabric: "100% raw silk",
      fabricWeightGsm: 220,
      targetGender: "Women",
      features: ["Floor length", "Fluted hem", "Hand-finished hem", "Concealed side zip"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-skirts",
    colorways: [
      { id: "raw-silk-fluted-skirt-raw-silk", name: "Raw Silk", hex: "#E4DCC8", sizes: stock(1, 2, 2, 1, 1, 0) },
    ],
    care: ["Dry clean only", "Silk marks with water", "Hang to store"],
    details: ["Made to order, 4–6 weeks", "Cut from the same bolt as the peplum top", "Model wears size S"],
    reviews: [
      rev(5, "Falls like water", "The weight in the hem does something you cannot see in a photograph. It just hangs.", "Iman B.", "2026-07-11", "5'4\"–5'6\"", "S", "true"),
      rev(4, "Order early", "Six weeks is real. Worth planning around if you have a date in mind.", "Solene P.", "2026-05-28", "5'7\"–5'9\"", "M", "true"),
    ],
  },

  {
    id: "STYLE-DRESS-001",
    handle: "column-gown",
    title: "Column Gown",
    category: "Dresses",
    shape: "gown",
    price: usd(2380),
    summary: "Floor-length black crepe, high neck and long sleeves, cut in one clean line.",
    description:
      "Entirely undecorated by intention — this is the ground the painted pieces are worn against. High neck, long fitted sleeves, and a narrow column that skims from shoulder to floor without a seam breaking the line. Cut on a slight bias so it moves with the body rather than against it.",
    attributes: {
      fit: "Draped",
      neckline: "High neck",
      sleeveLength: "Long",
      fabric: "100% silk crepe",
      fabricWeightGsm: 260,
      targetGender: "Women",
      features: ["Cut on the bias", "Invisible back zip", "Hand-finished hem", "Cut to wear with a heel"],
    },
    fit: { modelHeightCm: 180, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-dresses",
    colorways: [
      { id: "column-gown-ink", name: "Ink", hex: "#14130F", sizes: stock(1, 2, 2, 2, 1, 0) },
    ],
    care: ["Specialist dry clean only", "Store on a padded hanger", "Do not fold"],
    details: ["Made to order, 6–8 weeks", "Hem cut to your height at fitting", "Model wears size S"],
    reviews: [
      rev(5, "The best thing I own", "Nothing on it. No detail, no trim. It is entirely about the cut and it is flawless.", "Verity A.", "2026-07-28", "5'10\"–6'0\"", "M", "true"),
      rev(5, "Hemmed to me", "They cut the hem at the fitting to the exact heel I said I would wear. That is the difference.", "Ling Z.", "2026-07-04", "5'4\"–5'6\"", "S", "true"),
      rev(4, "Bias needs care", "It is cut on the bias, so it is unforgiving of a bad bra and it needs hanging properly. Worth the fuss.", "Ottilie R.", "2026-06-14", "5'7\"–5'9\"", "S", "true"),
      rev(5, "Wear it with the capelet", "Alone it is severe in the best way. With the painted capelet it becomes something else entirely.", "Fatima N.", "2026-05-19", "5'7\"–5'9\"", "M", "true"),
    ],
  },

  {
    id: "STYLE-DRESS-002",
    handle: "painted-column-gown",
    title: "Painted Column Gown",
    category: "Dresses",
    shape: "gown",
    price: usd(3200),
    summary: "The column gown with the motif painted directly onto the bodice.",
    description:
      "The same bias-cut column, painted directly rather than worn under a capelet. The motif begins at the shoulder and falls through the bodice, breaking before the hip so the line below stays uninterrupted. One of a kind by definition — each is painted on the finished garment.",
    attributes: {
      fit: "Draped",
      neckline: "High neck",
      sleeveLength: "Long",
      fabric: "100% silk crepe, hand-painted",
      fabricWeightGsm: 260,
      targetGender: "Women",
      features: ["Painted on the finished garment", "One of a kind", "Cut on the bias", "Hand-finished hem"],
    },
    fit: { modelHeightCm: 180, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-dresses",
    colorways: [
      { id: "painted-column-gown-ink", name: "Ink", hex: "#14130F", sizes: stock(0, 1, 1, 1, 0, 0) },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Store on a padded hanger"],
    details: ["Made to order, 8–10 weeks", "Painted individually — no two alike", "Model wears size S"],
    reviews: [
      rev(5, "Genuinely one of a kind", "They sent photographs of mine being painted. It is not the one in the lookbook and that is the whole point.", "Adaeze O.", "2026-07-16", "5'7\"–5'9\"", "S", "true"),
      rev(5, "Ten weeks, no regrets", "The longest I have ever waited for a garment and the only one I would wait that long for again.", "Constance M.", "2026-06-02", "5'10\"–6'0\"", "M", "true"),
    ],
  },

  {
    id: "STYLE-OUT-003",
    handle: "painted-overshirt",
    title: "Painted Overshirt",
    category: "Outerwear",
    shape: "jacket",
    price: usd(1420),
    summary: "Longer, looser painted cotton — the collection's most wearable piece.",
    description:
      "Cut longer and considerably easier than the cropped jacket, in the same painted cotton twill. Patch pockets, a soft shoulder, and enough room to go over the mandarin blouse. The piece people buy when they want the painting and wear it daily.",
    attributes: {
      fit: "Draped",
      neckline: "Collared",
      sleeveLength: "Long",
      fabric: "100% cotton twill, hand-painted",
      fabricWeightGsm: 340,
      targetGender: "Women",
      features: ["Hand-painted, no two alike", "Patch pockets", "Soft shoulder", "Cut to layer"],
    },
    fit: { modelHeightCm: 178, modelSizeWorn: "M", runsTrueToSize: "large" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "painted-overshirt-unbleached", name: "Unbleached", hex: "#E9E4D7", sizes: stock(1, 2, 3, 2, 1, 1) },
      { id: "painted-overshirt-ash",        name: "Ash",        hex: "#B9B4A6", sizes: stock(0, 1, 2, 1, 0, 0) },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Hang to store"],
    details: ["Made to order, 4–6 weeks", "Painted in the atelier", "Model wears size M"],
    reviews: [
      rev(5, "The one you actually wear", "I wanted the cropped jacket and bought this instead. Same painting, and I can put it on to buy coffee.", "Juno K.", "2026-07-22", "5'7\"–5'9\"", "M", "large"),
      rev(4, "Sizes generously", "Cut easy on purpose. I took a small and it is still roomy over a blouse.", "Emilia G.", "2026-06-26", "5'4\"–5'6\"", "S", "large"),
      rev(4, "Ash is very subtle", "The ash colourway is much quieter — the painting almost disappears into it. Lovely, but see it first.", "Noor A.", "2026-06-01", "5'10\"–6'0\"", "L", "large"),
    ],
  },
];

export function productByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}
