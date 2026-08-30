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

import { EASE, easeForFrame, step, arrived, clampTo, wheelPixels } from "./ease.ts";

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

function frame(now: number): void {
  const dt = lastTime ? now - lastTime : 16.7;
  lastTime = now;

  current = step(current, target, easeForFrame(dt, EASE));

  if (arrived(current, target, EASE)) {
    current = target;
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
  window.scrollTo({ top: current, behavior: "instant" });
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
