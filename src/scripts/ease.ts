/* ---------------------------------------------------------------
   The easing maths, kept separate from the DOM.

   scroll.ts wires this to wheel events and requestAnimationFrame.
   Pulling the arithmetic out means it can be exercised without a
   browser, which matters here: the behaviour is a curve over time,
   and "it looked right when I scrolled it" is not a check anyone can
   repeat.
   --------------------------------------------------------------- */

/**
 * Fraction of the remaining distance covered each frame.
 *
 * Lower is slower and heavier. At 0.075 a flick covers 90% of its distance
 * in about half a second, which is the "slow scroll" this page is after —
 * clearly weighted, still obedient. Below roughly 0.05 the page starts to
 * feel like it is ignoring the wheel.
 */
export const EASE = 0.075;

/**
 * The smallest movement worth drawing a frame for.
 *
 * Exponential approach has a very long tail: chasing a fixed 0.5px gap took
 * about a hundred frames, the last eighty of which moved less than a pixel
 * each and cost a frame apiece for nothing anyone could see. So the stop
 * condition is not "close enough to the target" but "the next frame could
 * not move a visible pixel" — which is what SUBPIXEL means below.
 */
export const SUBPIXEL = 0.5;

/** One frame of exponential approach. */
export const step = (current: number, target: number, ease = EASE): number =>
  current + (target - current) * ease;

/**
 * True once the next frame could not move a visible pixel, so there is
 * nothing left to animate. Snap to the target and stop.
 */
export const arrived = (current: number, target: number, ease = EASE): boolean =>
  Math.abs(target - current) * ease < SUBPIXEL;

/** Keep a target inside the document. */
export const clampTo = (value: number, max: number): number =>
  Math.max(0, Math.min(value, Math.max(0, max)));

/**
 * Runs the approach to completion, returning every position along the way.
 * Used by the test, and useful for reasoning about how long a gesture takes.
 */
export function trajectory(
  from: number,
  to: number,
  ease = EASE,
  maxFrames = 600,
): number[] {
  const out: number[] = [];
  let current = from;
  for (let i = 0; i < maxFrames; i++) {
    current = step(current, to, ease);
    if (arrived(current, to, ease)) {
      out.push(to);
      break;
    }
    out.push(current);
  }
  return out;
}

/**
 * Frames to cover a given fraction of the distance. This, not the frame at
 * which motion formally stops, is what a person actually perceives as the
 * length of the gesture.
 */
export function framesToCover(fraction: number, ease = EASE): number {
  return Math.ceil(Math.log(1 - fraction) / Math.log(1 - ease));
}
