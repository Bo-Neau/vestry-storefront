/* ---------------------------------------------------------------
   Eased scrolling.

   The site's only script. Momentum scrolling cannot be expressed in
   CSS, so this is here and nothing else is.

   It drives the real scroll rather than translating a wrapper, which
   is how most libraries do it. A wrapper would break the two things
   this page is built on: `position: sticky` (the header and every
   collection photograph) and `animation-timeline: view()` (every
   parallax layer and reveal), both of which read the actual scroll
   position. Driving the document keeps sticky sticking, timelines
   firing, the scrollbar honest and find-in-page working.

   It stays out of the way where it would do harm:
     - reduced motion: never runs
     - touch: never runs; the OS already does this better
     - pinch-zoom, and any modifier held: passes straight through
     - keyboard, scrollbar drag, anchor links: resync rather than fight
   --------------------------------------------------------------- */

import { EASE, FRAME_MS, easeForFrame, stepToward, arrived, clampTo, wheelPixels } from "./ease.ts";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const coarse = matchMedia("(pointer: coarse)");

let target = 0;
let current = 0;
let running = false;
let lastTime = 0;
/** True while we are the ones moving the page, so our own scroll events are
 *  not mistaken for the user grabbing the scrollbar. */
let driving = false;

const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const clamp = (v: number) => clampTo(v, maxScroll());

/**
 * The floor on how slowly the approach may move, for this display and this
 * frame.
 *
 * One device pixel: `1 / devicePixelRatio` in CSS pixels, so a retina screen
 * gets a finer walk-in rather than a coarser one. Scaled by how long the
 * frame took, for the same reason the ease is — the tail should be a speed in
 * pixels per second, not a distance per frame, or it runs twice as fast on a
 * 120Hz display.
 */
const devicePixel = (): number => 1 / (window.devicePixelRatio || 1);

function walkIn(dt: number): number {
  return devicePixel() * (Math.min(Math.max(dt, 1), 100) / FRAME_MS);
}

function frame(now: number): void {
  const dt = lastTime ? now - lastTime : FRAME_MS;
  lastTime = now;

  current = stepToward(current, target, easeForFrame(dt, EASE), walkIn(dt));

  if (arrived(current, target)) {
    running = false;
    lastTime = 0;
  }

  driving = true;
  /*
    `behavior: "instant"` is load-bearing.

    `html` carries `scroll-behavior: smooth` so that anchor links glide. The
    two-argument form of scrollTo obeys that, which meant every frame of this
    loop kicked off the browser's OWN smooth animation toward a target that
    had already moved — sixty competing animations a second. That is what
    made the scrolling feel like it was fighting back instead of easing.
    This opts one caller out without touching the anchors.
  */
  /*
    Asked for on the device-pixel grid, not as the raw float.

    A scroll offset is quantised whatever we hand it, and handing it a
    fractional position leaves the rounding to floating-point noise. During
    the one-pixel walk-in that showed up as 1, 0, 2, 0, 1, 2 rather than 1,
    1, 1, 1, 1, 1 — the same total distance delivered in a stutter, with the
    parallax freezing on the zero frames because the page really had not
    moved. Rounding here makes each frame ask for a position exactly one
    pixel on from the last, so the walk is even.

    `current` itself stays a float. Rounding it would drift the arithmetic
    away from the target and the walk-in would never land on it.
  */
  const px = devicePixel();
  window.scrollTo({ top: Math.round(current / px) * px, behavior: "instant" });
  driving = false;

  if (running) requestAnimationFrame(frame);
}

function start(): void {
  if (running) return;
  running = true;
  lastTime = 0;
  requestAnimationFrame(frame);
}

/** Adopt whatever the page's real position is — after a keypress, a
 *  scrollbar drag, an anchor jump, or a resize that changed the height. */
function resync(): void {
  target = current = window.scrollY;
  running = false;
  lastTime = 0;
}

function onWheel(event: WheelEvent): void {
  /*
    Re-check the conditions here rather than trusting that the media query
    told us they changed. `change` does not fire reliably everywhere — device
    emulation does not send it at all — and attach/detach alone left the
    eased scrolling running on a touch device where it should not be. This
    reads the live value, so it cannot be wrong.
  */
  if (reduced.matches || coarse.matches) return;

  // Pinch-to-zoom arrives as a wheel event with ctrlKey set. Never touch it.
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // Leave anything with its own scroller alone.
  if ((event.target as Element | null)?.closest?.("[data-native-scroll]")) return;

  /*
    Sideways intent belongs to whatever is under the pointer.

    The collection rails scroll horizontally. This handler used to
    preventDefault every wheel event and fold deltaY into the vertical
    ease, which meant a two-finger swipe across a rail — deltaX large,
    deltaY near zero — was cancelled and then applied as nothing. The rail
    simply would not move on a trackpad.

    Shift+wheel is the mouse spelling of the same gesture; browsers disagree
    about whether it arrives as deltaX or as deltaY with the modifier set,
    so both forms are handed back.
  */
  if (event.shiftKey) return;
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

  event.preventDefault();
  target = clamp(target + wheelPixels(event.deltaY, event.deltaMode, window.innerHeight));
  start();
}

function onScroll(): void {
  /*
    Only adopt a position we did not cause. During our own animation
    `running` is true; a native smooth anchor scroll leaves it false, which
    is exactly when we want to follow along rather than snap it back.
  */
  if (!driving && !running) resync();
}

function onKeydown(): void {
  if (!running) resync();
}

/*
  Listeners are attached once and never removed.

  The first version attached and detached as conditions changed, which was
  wrong twice over: `change` on a media query does not fire everywhere (device
  emulation never sends it), so a page opened on a touch device kept eased
  scrolling forever, and a page opened on one that later gained a mouse never
  got it at all. One always-on listener that checks the live values costs
  nothing and cannot get out of step.
*/
addEventListener("wheel", onWheel, { passive: false });
addEventListener("scroll", onScroll, { passive: true });
addEventListener("keydown", onKeydown, { passive: true });
addEventListener("resize", resync, { passive: true });

resync();
