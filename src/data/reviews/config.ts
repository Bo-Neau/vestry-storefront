/**
 * Okendo attribute mapping — the part that must be verified, not assumed.
 *
 * Okendo returns per-review "attributes with rating" shaped like:
 *
 *   { title: "Sizing", type: "centered-range", value: 1,
 *     minLabel: "Too Small", midLabel: "Just Right", maxLabel: "Too Big" }
 *
 * Two things are NOT reliably documented and vary by merchant, because the
 * attributes themselves are configured in the Okendo dashboard:
 *
 *   1. The attribute TITLES ("Sizing" vs "Fit" vs "How was the fit?").
 *   2. The numeric SCALE of a centered-range (1..5 with 3 centred is the
 *      common default, but it is a setting).
 *
 * Getting either wrong does not throw — it silently yields "true to size" for
 * every review, which looks like working software. So:
 *
 *     npm run okendo:doctor
 *
 * prints the real attribute titles, types and observed value ranges from your
 * store's live reviews. Correct this file against that output.
 */

export interface CenteredRangeScale {
  readonly min: number;
  readonly max: number;
}

export const OKENDO_MAPPING = {
  /**
   * Titles that mean "did this fit?". Matched case-insensitively, and the
   * first hit wins, so list the most specific first.
   */
  fitAttributeTitles: ["Sizing", "Fit", "Size", "How did it fit?"],

  /**
   * Assumed bounds for a centered-range fit attribute. Values at the midpoint
   * mean true to size; below means small, above means large.
   *
   * VERIFY with okendo:doctor — a wrong scale mislabels every review.
   */
  fitScale: { min: 1, max: 5 } satisfies CenteredRangeScale,

  /**
   * How far from the midpoint counts as a real signal rather than noise,
   * as a fraction of half the range. 0.25 on a 1..5 scale means a value of
   * 3.5+ reads as "large" and 2.5- as "small".
   */
  fitDeadZone: 0.25,

  /** Attribute titles carrying the reviewer's height. */
  heightAttributeTitles: ["Height", "How tall are you?"],

  /** Attribute titles carrying the size the reviewer bought. */
  sizePurchasedAttributeTitles: ["Size purchased", "Size bought", "Size ordered"],
} as const;

/** Reviews per request. Okendo caps this; 100 is a safe page size. */
export const OKENDO_PAGE_SIZE = 100;

/** How long to hold fetched reviews in memory. Reviews are not urgent. */
export const OKENDO_CACHE_TTL_MS = 5 * 60 * 1000;
