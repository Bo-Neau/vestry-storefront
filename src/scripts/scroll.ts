/* ---------------------------------------------------------------
   Eased scrolling.

   This is the one piece of JavaScript on the site, and it exists
   because momentum scrolling cannot be expressed in CSS.

   The usual way to build this — the way every library does it — is to
   translate a wrapper element and leave the document at scroll 0.
   That would break two things this page depends on: `position: sticky`
   (the header, and the photograph in each collection) and
   `animation-timeline: view()` (every parallax layer and reveal), both
   of which read the real scroll position.

   So this drives the real scroll instead. It intercepts the wheel,
   accumulates a target, and eases the document toward it frame by
   frame. Sticky still sticks, scroll timelines still fire, the
   scrollbar still reflects the truth, and find-in-page still works.

   It stays out of the way where it would do harm:
     - reduced motion: never runs
     - touch: never runs; the OS already does this better
     - pinch-zoom, and any modifier held: passes straight through
     - keyboard, scrollbar drag, anchor links: resync rather than fight
   --------------------------------------------------------------- */

import { EASE, step, arrived, clampTo } from "./ease.ts";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const coarse = matchMedia("(pointer: coarse)");


let target = 0;
let current = 0;
let running = false;
/** True while we are the ones calling scrollTo, so our own scroll events
 *  are not mistaken for the user grabbing the scrollbar. */
let driving = false;

const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const clamp = (v: number) => clampTo(v, maxScroll());

function frame(): void {
  current = step(current, target, EASE);

  if (arrived(current, target, EASE)) {
    current = target;
    running = false;
  }

  driving = true;
  window.scrollTo(0, current);
  driving = false;

  if (running) requestAnimationFrame(frame);
}

function start(): void {
  if (running) return;
  running = true;
  requestAnimationFrame(frame);
}

/** Adopt whatever the page's real position is — after a keypress, a
 *  scrollbar drag, an anchor jump, or a resize that changed the height. */
function resync(): void {
  target = current = window.scrollY;
  running = false;
}

function onWheel(event: WheelEvent): void {
  // Pinch-to-zoom arrives as a wheel event with ctrlKey set. Never touch it.
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // Let anything with its own scroller — a code block, a select — scroll.
  const inner = (event.target as Element | null)?.closest?.("[data-native-scroll]");
  if (inner) return;

  event.preventDefault();
  target = clamp(target + event.deltaY);
  start();
}

function enable(): void {
  resync();
  addEventListener("wheel", onWheel, { passive: false });

  // Anything that moves the page by other means wins; we follow it.
  addEventListener("scroll", () => { if (!driving && !running) resync(); }, { passive: true });
  addEventListener("keydown", () => { if (!running) resync(); }, { passive: true });
  addEventListener("resize", resync, { passive: true });

  /*
    Anchor links keep native smooth scrolling — it already eases, and
    reimplementing it here would mean duplicating scroll-padding and
    focus handling for no gain. Resync once it has settled so the next
    wheel event starts from the right place.
  */
  addEventListener("hashchange", () => setTimeout(resync, 700), { passive: true });
  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (link) setTimeout(resync, 700);
  }, { passive: true });
}

function disable(): void {
  removeEventListener("wheel", onWheel);
  running = false;
}

if (!reduced.matches && !coarse.matches) enable();

// Someone can turn reduced motion on without reloading the page.
reduced.addEventListener("change", (e) => {
  if (e.matches) disable();
  else if (!coarse.matches) enable();
});
