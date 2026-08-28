import type { ImageMetadata } from "astro";

/**
 * Resolves a stored photograph path to a build-time-optimised image.
 *
 * The photographs used to sit in `public/`, which meant Astro shipped them
 * untouched: a 2000px original served to a 375px phone, 4.6MB on the front
 * page. Files under `src/` are processed at build instead, so the same
 * photograph can be emitted at several widths in AVIF and WebP.
 *
 * The data layer still stores a plain string (`/photography/name.jpg`) rather
 * than an import, because the catalogue is generated and a generated file full
 * of ESM imports is far harder to hand-edit than one full of paths.
 */
const FILES = import.meta.glob<{ default: ImageMetadata }>(
  "../../assets/photography/*.{jpg,jpeg,png}",
  { eager: true },
);

/** `../../assets/photography/painted-capelet-cutout.jpg` -> `painted-capelet-cutout.jpg` */
const basename = (path: string): string => path.split("/").pop() ?? path;

const BY_NAME = new Map<string, ImageMetadata>(
  Object.entries(FILES).map(([path, mod]) => [basename(path), mod.default]),
);

/**
 * Looks up a photograph by the path stored in the data layer.
 *
 * Returns undefined rather than throwing so a mistyped filename degrades to a
 * missing picture instead of a blank page — but `assertAllResolve` below turns
 * that into a build-time failure, which is where it belongs.
 */
export function resolvePhoto(src: string): ImageMetadata | undefined {
  return BY_NAME.get(basename(src));
}

/** Every filename the bundler found. Used by the test that guards the set. */
export function knownPhotographs(): string[] {
  return [...BY_NAME.keys()].sort();
}
