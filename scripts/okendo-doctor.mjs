/**
 * Inspects real Okendo reviews and reports what to configure.
 *
 *   npm run okendo:doctor
 *
 * Two things in src/data/reviews/config.ts are informed guesses, because both
 * are configured per-merchant in the Okendo dashboard:
 *
 *   - the attribute TITLES ("Sizing" vs "Fit" vs something custom)
 *   - the numeric SCALE of the centered-range fit attribute
 *
 * Neither failure throws. A wrong title or scale yields "true to size" for
 * every review, which looks like it works. This prints the truth.
 */
import { OKENDO_MAPPING } from "../src/data/reviews/config.ts";
import { fitFromAttribute } from "../src/data/reviews/okendo.ts";

const userId = (process.env.OKENDO_USER_ID ?? "").trim();
const tick = (ok) => (ok ? "✓" : "✗");

if (!userId) {
  console.error("\nOKENDO_USER_ID is not set in .env.");
  console.error("Find it in Okendo: Settings → Integrations, or in the");
  console.error("okendo-reviews script tag on your live storefront.\n");
  process.exit(1);
}

console.log(`\nOkendo doctor — store ${userId}\n`);

const url = new URL(`https://api.okendo.io/v1/stores/${encodeURIComponent(userId)}/reviews`);
url.searchParams.set("limit", "100");
url.searchParams.set("orderBy", "date desc");

let body;
try {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error(`  ${tick(false)} HTTP ${res.status} from Okendo.`);
    console.error("     OKENDO_USER_ID is the Okendo store id, not the Shopify store name.");
    process.exit(1);
  }
  body = await res.json();
} catch (e) {
  console.error(`  ${tick(false)} ${e.message}`);
  process.exit(1);
}

const reviews = body.reviews ?? [];
console.log(`1. Connection\n   ${tick(true)} fetched ${reviews.length} published review(s)\n`);

if (reviews.length === 0) {
  console.log("   No published reviews yet. Attribute mapping cannot be verified");
  console.log("   until some exist. Publish a test review and re-run.\n");
  process.exit(0);
}

/* 2. Observed attributes ------------------------------------------------- */
const seen = new Map(); // title -> { type, values:Set, labels }
for (const r of reviews) {
  for (const a of [...(r.attributesWithRating ?? []), ...(r.attributes ?? [])]) {
    const title = (a.title ?? "(untitled)").trim();
    const entry = seen.get(title) ?? {
      type: a.type ?? "—", values: new Set(),
      minLabel: a.minLabel, midLabel: a.midLabel, maxLabel: a.maxLabel,
    };
    entry.values.add(a.value);
    seen.set(title, entry);
  }
}

console.log("2. Attributes present on this store's reviews");
for (const [title, e] of seen) {
  const nums = [...e.values].filter((v) => typeof v === "number");
  const range = nums.length
    ? `observed ${Math.min(...nums)}..${Math.max(...nums)}`
    : `values: ${[...e.values].slice(0, 4).map((v) => JSON.stringify(v)).join(", ")}`;
  console.log(`   • "${title}"  [${e.type}]  ${range}`);
  if (e.minLabel || e.maxLabel) {
    console.log(`       ${e.minLabel ?? "?"} → ${e.midLabel ?? "?"} → ${e.maxLabel ?? "?"}`);
  }
}

/* 3. Do our configured titles match? ------------------------------------- */
console.log("\n3. Configured titles vs reality");
const titles = [...seen.keys()].map((t) => t.toLowerCase());
const check = (label, configured) => {
  const hit = configured.find((c) => titles.includes(c.toLowerCase()));
  if (hit) console.log(`   ${tick(true)} ${label.padEnd(16)} matched "${hit}"`);
  else console.log(`   ${tick(false)} ${label.padEnd(16)} no match for ${configured.map((c) => `"${c}"`).join(", ")}`);
  return Boolean(hit);
};
const fitOk = check("fit", OKENDO_MAPPING.fitAttributeTitles);
check("height", OKENDO_MAPPING.heightAttributeTitles);
check("size purchased", OKENDO_MAPPING.sizePurchasedAttributeTitles);

/* 4. Scale sanity -------------------------------------------------------- */
console.log("\n4. Fit scale");
const fitTitle = [...seen.keys()].find((t) =>
  OKENDO_MAPPING.fitAttributeTitles.some((c) => c.toLowerCase() === t.toLowerCase()),
);
if (!fitTitle) {
  console.log(`   ${tick(false)} no fit attribute found — nothing to verify`);
} else {
  const e = seen.get(fitTitle);
  const nums = [...e.values].filter((v) => typeof v === "number");
  const observed = { min: Math.min(...nums), max: Math.max(...nums) };
  const cfg = OKENDO_MAPPING.fitScale;
  console.log(`   configured ${cfg.min}..${cfg.max}, observed ${observed.min}..${observed.max}`);
  if (observed.min < cfg.min || observed.max > cfg.max) {
    console.log(`   ${tick(false)} values fall OUTSIDE the configured scale — fix fitScale`);
  } else {
    console.log(`   ${tick(true)} observed values sit inside the configured scale`);
  }
  console.log("\n   How each observed value would be labelled:");
  for (const v of nums.sort((a, b) => a - b)) {
    console.log(`     ${String(v).padStart(4)} → ${fitFromAttribute({ value: v })}`);
  }
  console.log(`\n   Sanity check against the labels above:`);
  console.log(`     "${e.minLabel ?? "?"}" should map to  small`);
  console.log(`     "${e.midLabel ?? "?"}" should map to  true`);
  console.log(`     "${e.maxLabel ?? "?"}" should map to  large`);
  console.log(`   If that is inverted, the scale or the labels are reversed.`);
}

/* 5. Product id join ----------------------------------------------------- */
console.log("\n5. Product id format (used to join reviews to products)");
const ids = [...new Set(reviews.map((r) => r.productId).filter(Boolean))].slice(0, 3);
for (const id of ids) console.log(`   ${id}`);
console.log("   Joined on the numeric tail, so gid and bare id both work.");

console.log(
  fitOk
    ? "\nFit attribute is wired. Correct any mismatch above in src/data/reviews/config.ts\n"
    : "\nFit attribute NOT matched — reviews will all read 'true to size'.\n" +
      "Add the real title to fitAttributeTitles in src/data/reviews/config.ts\n",
);
