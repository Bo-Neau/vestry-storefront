/* ---------------------------------------------------------------
   The easing maths, kept separate from the DOM.

   scroll.ts wires this to wheel events and requestAnimationFrame.
   Pulling the arithmetic out means it can be exercised without a
   browser, which matters here: the behaviour is a curve over time,
   and "it looked right when I scrolled it" is not a check anyone can
   repeat.
   --------------------------------------------------------------- */

/**
 * Fraction of the remaining distance covered per 60fps frame.
 *
 * Lower is slower and heavier. At 0.11 a flick covers 90% of its distance in
 * about 350ms: clearly weighted, still obedient. Below roughly 0.06 the page
 * starts to feel like it is ignoring the wheel rather than gliding.
 */
export const EASE = 0.11;

/** The reference frame length this ease is expressed against. */
export const FRAME_MS = 1000 / 60;

/** The smallest movement worth drawing a frame for. */
export const SUBPIXEL = 0.5;

/**
 * A wheel notch in pixels, used to convert the line and page delta modes
 * that Firefox and some mice report. Chrome's own pixel-mode notch is about
 * this size, so it keeps the feel consistent across browsers.
 */
export const LINE_HEIGHT = 34;

/**
 * The ease adjusted for how long the frame actually took.
 *
 * Without this the scroll runs at whatever rate the display does: applying a
 * fixed 0.11 twice as often on a 120Hz screen makes the page settle twice as
 * fast, so the same gesture feels different on a ProMotion laptop than on an
 * external monitor. Compounding it by elapsed time makes the curve a function
 * of seconds rather than frames.
 *
 * `dt` is clamped because a backgrounded tab can hand back a delta of several
 * seconds, which would otherwise resolve as an instant jump.
 */
export function easeForFrame(dt: number, ease = EASE): number {
  const clamped = Math.min(Math.max(dt, 1), 100);
  return 1 - Math.pow(1 - ease, clamped / FRAME_MS);
}

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
 * A wheel event's delta in pixels.
 *
 * `deltaY` is only in pixels when `deltaMode` is 0. Firefox reports lines,
 * and some mice report pages; taking the raw number meant a flick moved
 * three pixels instead of a hundred on those setups.
 */
export function wheelPixels(deltaY: number, deltaMode: number, viewportHeight = 800): number {
  if (deltaMode === 1) return deltaY * LINE_HEIGHT;      // DOM_DELTA_LINE
  if (deltaMode === 2) return deltaY * viewportHeight;   // DOM_DELTA_PAGE
  return deltaY;                                         // DOM_DELTA_PIXEL
}

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
 * which motion formally stops, is what a person perceives as the length of
 * the gesture.
 */
export function framesToCover(fraction: number, ease = EASE): number {
  return Math.ceil(Math.log(1 - fraction) / Math.log(1 - ease));
}
