import type { Product, Review, Size, SizeStock } from "./schema.ts";

/* ---------------------------------------------------------------------------
 * Manussa — the collection.
 *
 * Pieces, designers, collections and photography all come from the brand
 * booklet. The house is a collective, so every piece carries the name of the
 * designer who made it, and hand-painted work credits the artist separately.
 *
 * Prices, stock levels and reviews are PLACEHOLDERS awaiting the client.
 * Everything else — names, designers, collections, materials, imagery — is
 * from the brand's own material.
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

const img = (name: string, alt: string, w: number, h: number, view: "front" | "back" | "flat" | "detail") =>
  ({ src: `/photography/${name}.jpg`, alt, width: w, height: h, view });

/* -------------------------------------------------------------------------- */

export const PRODUCTS: readonly Product[] = [
  {
    id: "MNS-HOPE-001",
    handle: "painted-capelet",
    title: "Painted Capelet",
    designer: "Katherine Paing",
    artist: "Win Min Than",
    collection: "The Hope Collection",
    category: "Outerwear",
    shape: "cape",
    price: usd(1240),
    summary: "Structured capelet, hand-painted at the shoulder in smoke and ink.",
    description:
      "The signature piece of the Hope Collection. Painted by hand across both shoulders so the motif falls and fades toward the hem, taken from Zaw Win Pe's painting “The Hell”. Cut with a firm shoulder so it holds its shape away from the body and sits over a narrow column without crushing the sleeve. Each is painted individually — no two fall the same way.",
    attributes: {
      fit: "Sculptural",
      neckline: "Open",
      sleeveLength: "Sleeveless",
      fabric: "Cotton twill, hand-painted",
      fabricWeightGsm: 340,
      targetGender: "Women",
      features: ["Hand-painted by Win Min Than", "No two alike", "Structured shoulder", "Beaded drip detail"],
    },
    fit: { modelHeightCm: 178, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "painted-capelet-unbleached", name: "Unbleached", hex: "#E9E4D7", sizes: stock(1, 2, 2, 1, 1, 0),
        images: [
          img("painted-capelet-cutout", "Painted Capelet, front view", 1033, 1549, "front"),
          img("capelet-over-gown-cutout", "Painted Capelet worn over the Column Gown", 620, 1453, "back"),
        ] },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Store flat"],
    details: ["Made to order", "Hand-painted in the atelier, Yangon", "Model wears size S"],
    reviews: [
      rev(5, "Transforms a plain dress", "Wore it over the column gown and it was the only thing anyone talked about all evening.", "Mireille A.", "2026-07-02", "5'7\"–5'9\"", "S", "true"),
      rev(4, "Heavier than expected", "It has real weight, which is what makes the shoulder hold. Not something you forget you are wearing.", "Sofia K.", "2026-06-11", "5'4\"–5'6\"", "XS", "true"),
    ],
  },

  {
    id: "MNS-HOPE-002",
    handle: "column-gown",
    title: "Column Gown",
    designer: "Katherine Paing",
    collection: "The Hope Collection",
    category: "Dresses",
    shape: "gown",
    price: usd(980),
    summary: "Floor-length black jersey, high neck and long sleeves, cut in one line.",
    description:
      "Deliberately undecorated — this is the ground the painted pieces are worn against. High neck, long fitted sleeves, and a narrow column that skims from shoulder to floor without a seam breaking the line.",
    attributes: {
      fit: "Draped",
      neckline: "High neck",
      sleeveLength: "Long",
      fabric: "Stretch jersey",
      fabricWeightGsm: 260,
      targetGender: "Women",
      features: ["Cut to wear with a heel", "Hand-finished hem", "Designed to layer under the capelet"],
    },
    fit: { modelHeightCm: 178, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-dresses",
    colorways: [
      { id: "column-gown-black", name: "Black", hex: "#14130F", sizes: stock(1, 2, 3, 2, 1, 0),
        images: [
          img("capelet-over-gown-cutout", "Column Gown, worn with the Painted Capelet", 620, 1453, "front"),
          img("lace-gown-model", "Column silhouette, worn", 1271, 1906, "back"),
        ] },
    ],
    care: ["Dry clean recommended", "Store on a padded hanger", "Do not fold"],
    details: ["Hem cut to your height at fitting", "Model wears size S"],
    reviews: [
      rev(5, "Nothing on it, and that is the point", "No trim, no detail. Entirely about the cut, and the cut is flawless.", "Verity A.", "2026-07-28", "5'10\"–6'0\"", "M", "true"),
      rev(5, "Wear it with the capelet", "Alone it is severe in the best way. With the painted capelet it becomes something else entirely.", "Fatima N.", "2026-05-19", "5'7\"–5'9\"", "M", "true"),
    ],
  },

  {
    id: "MNS-HOPE-003",
    handle: "painted-corset-bodice",
    title: "Painted Corset Bodice",
    designer: "Ei Ko Zin Latt",
    artist: "Win Min Than",
    collection: "The Hope Collection",
    category: "Tops",
    shape: "top",
    price: usd(890),
    summary: "Raw silk bodice with a sculptural peplum, painted across the front.",
    description:
      "Undyed raw silk, slubbed and matte, boned through the body and released into a sculptural petal peplum at the hip. The painting runs across the bodice rather than the shoulder, so it reads as a panel. Mandarin collar, concealed front zip.",
    attributes: {
      fit: "Fitted",
      neckline: "Mandarin",
      sleeveLength: "Sleeveless",
      fabric: "Raw silk, hand-painted",
      fabricWeightGsm: 220,
      targetGender: "Women",
      features: ["Hand-painted by Win Min Than", "Boned bodice", "Petal peplum", "Concealed zip"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "painted-corset-raw-silk", name: "Raw Silk", hex: "#E4DCC8", sizes: stock(1, 2, 2, 1, 0, 0),
        images: [
          img("painted-corset-mannequin", "Painted Corset Bodice, front view", 896, 1344, "front"),
        ] },
    ],
    care: ["Specialist dry clean only", "Do not press the painted panel", "Silk marks with water"],
    details: ["Made to order", "Undyed raw silk", "Model wears size S"],
    reviews: [
      rev(5, "The silk holds the paint", "Slubbed and completely matte — you can see the weave through the grey. A smooth silk would never do this.", "Anouk V.", "2026-07-09", "5'7\"–5'9\"", "S", "small"),
      rev(4, "Boned, so size carefully", "There is no give at all. Beautiful line once you have the right size, but try it on.", "Georgia L.", "2026-06-17", "5'4\"–5'6\"", "S", "small"),
    ],
  },

  {
    id: "MNS-HOPE-004",
    handle: "raw-silk-fluted-skirt",
    title: "Raw Silk Fluted Skirt",
    designer: "Ei Ko Zin Latt",
    collection: "The Hope Collection",
    category: "Skirts",
    shape: "skirt",
    price: usd(760),
    summary: "Floor-length raw silk, narrow to the knee then released into a flute.",
    description:
      "Cut from the same bolt as the painted bodice so the two read as one piece. Narrow through the hip, then released below the knee into a fluted hem that moves without adding width. Hem finished by hand and left slightly heavy so it falls straight.",
    attributes: {
      fit: "Draped",
      fabric: "Raw silk",
      fabricWeightGsm: 220,
      targetGender: "Women",
      features: ["Floor length", "Fluted hem", "Hand-finished hem", "Cut from the same bolt as the bodice"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-skirts",
    colorways: [
      { id: "raw-silk-skirt-raw-silk", name: "Raw Silk", hex: "#E4DCC8", sizes: stock(1, 2, 2, 1, 1, 0),
        images: [
          img("raw-silk-gown-cutout", "Raw Silk Fluted Skirt with the painted bodice", 700, 2048, "front"),
          img("raw-silk-gown-mannequin", "Raw silk bodice and skirt on the stand", 1366, 2048, "back"),
        ] },
    ],
    care: ["Dry clean only", "Silk marks with water", "Hang to store"],
    details: ["Made to order", "Undyed raw silk", "Model wears size S"],
    reviews: [
      rev(5, "Falls like water", "The weight in the hem does something you cannot see in a photograph. It just hangs.", "Iman B.", "2026-07-11", "5'4\"–5'6\"", "S", "true"),
    ],
  },

  {
    id: "MNS-LTD-001",
    handle: "elegant-powerful-jacket",
    title: "Elegant Powerful Jacket",
    designer: "Pan Ywal Oo",
    collection: "Limited Collection",
    category: "Outerwear",
    shape: "jacket",
    price: usd(2450),
    summary: "Hand-stitched faces emerging from the painting, with organza sleeves.",
    description:
      "Art meets tailoring. The bodice is worked entirely by hand, the stitches drawing out the faces that emerge from the original painting. Sleeves are built in layered organza and beaded ruffle, weightless against the dense hand-work of the body. A limited piece — each takes weeks at the bench.",
    attributes: {
      fit: "Fitted",
      neckline: "High neck",
      sleeveLength: "Long",
      fabric: "Hand-stitched cloth with organza",
      fabricWeightGsm: 300,
      targetGender: "Women",
      features: ["Hand-stitched face line art", "Beaded organza sleeves", "Limited edition", "Weeks of bench work"],
    },
    fit: { modelHeightCm: 178, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "elegant-powerful-black", name: "Black", hex: "#14130F", sizes: stock(0, 1, 1, 1, 0, 0),
        images: [
          img("beaded-jacket-front", "Elegant Powerful Jacket, front view", 1365, 2048, "front"),
          img("beaded-jacket-angle", "Elegant Powerful Jacket, three-quarter view", 1344, 2016, "back"),
        ] },
    ],
    care: ["Specialist dry clean only", "Do not press the beading", "Store on a padded hanger"],
    details: ["Limited edition", "Hand-stitched in the atelier", "Model wears size S"],
    reviews: [
      rev(5, "You can see the hand in it", "Up close the stitching resolves into faces. Photographs flatten it completely.", "Camille D.", "2026-07-18", "5'7\"–5'9\"", "S", "small"),
      rev(4, "Cut close through the shoulder", "I am usually a small and needed the medium to move properly in it.", "Ines R.", "2026-06-24", "5'4\"–5'6\"", "S", "small"),
    ],
  },

  {
    id: "MNS-CRIM-001",
    handle: "crimson-drive-jacket",
    title: "Crimson Drive Jacket",
    designer: "Katherine Paing",
    collection: "Crimson Drive",
    category: "Outerwear",
    shape: "jacket",
    price: usd(680),
    summary: "Traditional textile reworked as a tailored jacket, piped in crimson.",
    description:
      "From the ready-to-wear line. Traditional woven textile, worked with tailoring technique into a jacket that moves from a professional meeting to a dinner without changing. The crimson piping traces the seams, taken from the artwork the collection is drawn from.",
    attributes: {
      fit: "Tailored",
      neckline: "Collared",
      sleeveLength: "Long",
      fabric: "Traditional woven textile",
      fabricWeightGsm: 280,
      targetGender: "Women",
      features: ["Crimson seam piping", "Traditional textile", "Day to night", "Welt pockets"],
    },
    fit: { modelHeightCm: 172, modelSizeWorn: "M", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "crimson-drive-black", name: "Black", hex: "#14130F", sizes: stock(2, 3, 4, 3, 2, 1),
        images: [
          img("day-to-night-trio", "Crimson Drive Jacket, styled three ways", 860, 1290, "front"),
          img("day-to-night-artwork", "Crimson Drive tailoring against the source artwork", 847, 1271, "back"),
        ] },
    ],
    care: ["Dry clean only", "Cool iron on the reverse"],
    details: ["Ready to wear", "Woven in Myanmar", "Model wears size M"],
    reviews: [
      rev(5, "Works for both halves of the day", "Wore it to a client meeting and straight on to dinner. That is exactly what it promises.", "Rania O.", "2026-06-30", "5'4\"–5'6\"", "M", "true"),
      rev(4, "The piping is the detail", "It looks plain in photographs and then you see the red tracing every seam.", "Delphine C.", "2026-07-25", "5'7\"–5'9\"", "L", "true"),
    ],
  },

  {
    id: "MNS-CRIM-002",
    handle: "mens-panelled-jacket",
    title: "Men's Panelled Jacket",
    designer: "Sa Thaw Zin Hut",
    collection: "Crimson Drive",
    category: "Outerwear",
    shape: "jacket",
    price: usd(640),
    summary: "A modern silhouette fused with Myanmar's ethnic dress.",
    description:
      "Mandarin collar and a clean front, broken by a hand-worked panel running the length of the body. The cut is contemporary; the panel and its embroidery are drawn directly from traditional dress.",
    attributes: {
      fit: "Tailored",
      neckline: "Mandarin",
      sleeveLength: "Long",
      fabric: "Cotton blend with embroidered panel",
      fabricWeightGsm: 300,
      targetGender: "Men",
      features: ["Hand-embroidered panel", "Mandarin collar", "Concealed placket"],
    },
    fit: { modelHeightCm: 183, modelSizeWorn: "M", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "mens-panelled-black", name: "Black", hex: "#14130F", sizes: stock(1, 3, 4, 3, 2, 1),
        images: [
          img("mens-jacket-model", "Men's Panelled Jacket, worn", 837, 1255, "front"),
        ] },
    ],
    care: ["Dry clean only", "Do not press the embroidered panel"],
    details: ["Ready to wear", "Hand-embroidered panel", "Model wears size M"],
    reviews: [
      rev(5, "Quietly unusual", "Reads as a plain black jacket until someone notices the panel. Exactly what I wanted.", "Thet A.", "2026-07-14", "6'1\" or above", "L", "true"),
    ],
  },

  {
    id: "MNS-DENIM-001",
    handle: "melting-paint-denim-jacket",
    title: "Melting Paint Denim Jacket",
    designer: "Katherine Paing",
    collection: "Contemporary",
    category: "Outerwear",
    shape: "jacket",
    price: usd(720),
    summary: "White denim with paintwork spilling from open black stitching.",
    description:
      "Denim is timeless, art is priceless. The signature detail is melting paintwork spilling from bold, open black stitching, echoing the artwork worked into every piece. Pared back and avant-garde at once — a jacket for daylight that behaves like a limited piece.",
    attributes: {
      fit: "Sculptural",
      neckline: "Collared",
      sleeveLength: "Long",
      fabric: "Cotton denim, hand-painted",
      fabricWeightGsm: 380,
      targetGender: "Unisex",
      features: ["Melting paintwork", "Open black stitching", "Sculpted sleeve", "Hand-finished"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "melting-paint-white", name: "Optic White", hex: "#EDEAE1", sizes: stock(1, 2, 3, 2, 1, 0),
        images: [
          img("white-denim-pair", "Melting Paint Denim, worn", 1942, 1295, "front"),
        ] },
    ],
    care: ["Specialist dry clean only", "Do not press the paintwork", "Hang to store"],
    details: ["Ready to wear", "Hand-painted detail", "Model wears size S"],
    reviews: [
      rev(5, "The one you actually wear", "I wanted a limited piece and bought this instead. Same hand-painting, and I can put it on in daylight.", "Juno K.", "2026-07-22", "5'7\"–5'9\"", "M", "true"),
      rev(4, "White denim, so be careful", "It is what it is. Beautiful, and I would not wear it to eat pasta.", "Emilia G.", "2026-06-26", "5'4\"–5'6\"", "S", "true"),
    ],
  },

  {
    id: "MNS-DENIM-002",
    handle: "indigo-panel-denim-jacket",
    title: "Indigo Panel Denim Jacket",
    designer: "Katherine Paing",
    collection: "Contemporary",
    category: "Outerwear",
    shape: "jacket",
    price: usd(690),
    summary: "Denim revived through traditional panels, pieced with golden thread.",
    description:
      "Each panel of traditional textile is cut and pieced together with golden thread, evoking an ancient, regal richness while staying firmly contemporary. Denim as the modern textile, carrying local pattern rather than replacing it.",
    attributes: {
      fit: "Tailored",
      neckline: "Collared",
      sleeveLength: "Three-quarter",
      fabric: "Indigo denim with traditional panels",
      fabricWeightGsm: 380,
      targetGender: "Unisex",
      features: ["Gold-thread piecing", "Traditional textile panels", "Cropped sleeve"],
    },
    fit: { modelHeightCm: 172, modelSizeWorn: "M", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "indigo-panel-indigo", name: "Indigo", hex: "#252F45", sizes: stock(1, 2, 3, 2, 1, 0),
        images: [
          img("blue-denim-pair", "Indigo Panel Denim Jacket, worn", 896, 1344, "front"),
        ] },
    ],
    care: ["Machine wash cold, inside out", "Hang to dry", "Warm iron"],
    details: ["Ready to wear", "Gold-thread piecing", "Model wears size M"],
    reviews: [
      rev(5, "The gold thread catches everything", "In daylight it is a denim jacket. Under lights the piecing lights up.", "Nadia F.", "2026-07-05", "5'4\"–5'6\"", "S", "true"),
    ],
  },

  {
    id: "MNS-TRAD-001",
    handle: "new-traditional-patchwork-jacket",
    title: "New Traditional Patchwork Jacket",
    designer: "Katherine Paing",
    collection: "New Traditional",
    category: "Outerwear",
    shape: "jacket",
    price: usd(750),
    summary: "Genderless patchwork in traditional weaves — versatile and weatherproof.",
    description:
      "Everyday wear built to be versatile, chic and weatherproof. Patterns once reserved separately for men and women are brought into a single language of patchwork. This is traditional dress carried from custom into a modern concept — a genderless piece, cut easy.",
    attributes: {
      fit: "Draped",
      neckline: "Collared",
      sleeveLength: "Long",
      fabric: "Pieced traditional weaves",
      fabricWeightGsm: 340,
      targetGender: "Unisex",
      features: ["Genderless cut", "Patchwork of traditional weaves", "Weatherproof finish", "Dropped shoulder"],
    },
    fit: { modelHeightCm: 172, modelSizeWorn: "M", runsTrueToSize: "large" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "new-traditional-indigo", name: "Indigo Patchwork", hex: "#252F45", hexAlt: "#3E4A63", sizes: stock(2, 3, 4, 3, 2, 1),
        images: [
          img("patchwork-jacket-model", "New Traditional Patchwork Jacket, worn", 1328, 1992, "front"),
        ] },
    ],
    care: ["Dry clean recommended", "Cool iron on the reverse"],
    details: ["Ready to wear", "Genderless sizing", "Model wears size M"],
    reviews: [
      rev(5, "Every panel is different", "Mine has a stripe through the shoulder that the lookbook one does not. That is the appeal.", "Kyaw M.", "2026-07-19", "5'10\"–6'0\"", "L", "large"),
      rev(4, "Cut generously", "Sized down and it is still easy. Read the fit note.", "Su Lin", "2026-06-08", "5'4\"–5'6\"", "S", "large"),
    ],
  },

  {
    id: "MNS-RTW-001",
    handle: "mosaic-peplum-top",
    title: "Mosaic Peplum Top",
    designer: "Kay",
    collection: "Standard Line",
    category: "Tops",
    shape: "top",
    price: usd(390),
    summary: "A printed mosaic peplum over a clean sleeveless bodice.",
    description:
      "From the standard line — the everyday half of the collection. A plain sleeveless bodice broken by a printed peplum in mosaic blues and gold, drawn from temple tilework. Cut to wear with wide trousers or on its own.",
    attributes: {
      fit: "Fitted",
      neckline: "Round",
      sleeveLength: "Sleeveless",
      fabric: "Cotton blend with printed panel",
      fabricWeightGsm: 200,
      targetGender: "Women",
      features: ["Printed mosaic peplum", "Clean bodice", "Everyday weight"],
    },
    fit: { modelHeightCm: 170, modelSizeWorn: "S", runsTrueToSize: "true" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "mosaic-peplum-white", name: "White Mosaic", hex: "#EDEAE1", hexAlt: "#3E6EA8", sizes: stock(2, 4, 5, 3, 2, 1),
        images: [
          img("printed-peplum-model", "Mosaic Peplum Top with flared trousers", 1344, 2016, "front"),
        ] },
    ],
    care: ["Machine wash cold", "Cool iron on the reverse"],
    details: ["Standard line", "Print drawn from temple tilework", "Model wears size S"],
    reviews: [
      rev(5, "The everyday one", "Not the piece in the lookbook and the one I have worn most. Goes with everything.", "Marta E.", "2026-07-14", "5'7\"–5'9\"", "M", "true"),
      rev(4, "Peplum stands away", "Firmer than it looks in the photograph. Not a soft silhouette.", "Priya S.", "2026-06-05", "5'4\"–5'6\"", "XS", "true"),
    ],
  },

  {
    id: "MNS-RTW-002",
    handle: "coral-embroidered-gown",
    title: "Coral Embroidered Gown",
    designer: "Sandi",
    collection: "Standard Line",
    category: "Dresses",
    shape: "gown",
    price: usd(1180),
    summary: "Ivory lace with coral embroidery branching across the bodice.",
    description:
      "A floor-length ivory gown in fine lace, with coral-thread embroidery branching from the waist across the bodice and over one shoulder. Cut close through the body and released below the knee. For the occasions the limited pieces are too severe for.",
    attributes: {
      fit: "Fitted",
      neckline: "Round",
      sleeveLength: "Sleeveless",
      fabric: "Lace with hand embroidery",
      fabricWeightGsm: 180,
      targetGender: "Women",
      features: ["Coral-thread embroidery", "Fine lace", "Fluted hem", "Hand-finished"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-dresses",
    colorways: [
      { id: "coral-gown-ivory", name: "Ivory", hex: "#F0EBDF", hexAlt: "#C96A5A", sizes: stock(1, 2, 2, 1, 0, 0),
        images: [
          img("lace-gown-model", "Coral Embroidered Gown, worn", 1271, 1906, "front"),
        ] },
    ],
    care: ["Specialist dry clean only", "Do not press the embroidery", "Store on a padded hanger"],
    details: ["Made to order", "Hand-embroidered", "Model wears size S"],
    reviews: [
      rev(5, "The embroidery is not printed", "It is worked by hand and you can feel it. Completely different thing.", "Ottilie R.", "2026-07-16", "5'7\"–5'9\"", "S", "small"),
      rev(4, "Runs small through the bust", "Lace has no give. I would size up.", "Cleo B.", "2026-06-14", "5'4\"–5'6\"", "S", "small"),
    ],
  },

  {
    id: "MNS-HOPE-005",
    handle: "structured-peplum-vest",
    title: "Structured Peplum Vest",
    designer: "Katherine Paing",
    collection: "The Hope Collection",
    category: "Tops",
    shape: "top",
    price: usd(520),
    summary: "Sleeveless, sharply fitted, with sculptural buttons carved one by one.",
    description:
      "Sleeveless and close through the body, breaking into a short firm peplum at the hip. The buttons are carved individually and no two are identical — they are the reason the front is otherwise entirely plain.",
    attributes: {
      fit: "Fitted",
      neckline: "Round",
      sleeveLength: "Sleeveless",
      fabric: "Wool crepe",
      fabricWeightGsm: 280,
      targetGender: "Women",
      features: ["Carved buttons, no two alike", "Structured peplum", "Fully lined"],
    },
    fit: { modelHeightCm: 175, modelSizeWorn: "S", runsTrueToSize: "small" },
    sizeChartId: "chart-tops",
    colorways: [
      { id: "peplum-vest-chalk", name: "Chalk", hex: "#EDE9E0", sizes: stock(2, 3, 3, 2, 1, 0),
        images: [
          img("collection-lineup", "Structured Peplum Vest, shown with the collection", 2016, 1344, "front"),
        ] },
    ],
    care: ["Dry clean only", "Cool iron on the reverse", "Do not iron the buttons"],
    details: ["Made in the atelier", "Carved buttons", "Model wears size S"],
    reviews: [
      rev(5, "The buttons alone", "I bought it for the tailoring and fell for the buttons. They catch the light like stone.", "Halima T.", "2026-07-21", "5'4\"–5'6\"", "S", "small"),
    ],
  },
];

export function productByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}
