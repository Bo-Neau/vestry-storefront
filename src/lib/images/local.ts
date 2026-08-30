import type { ImageMetadata } from "astro";

/**
 * Resolves a photograph name to a build-time-optimised image.
 *
 * The content layer stores a plain stem — "hero-denim-car" — rather than an
 * import or a path. That keeps src/data/site.ts readable as content: someone
 * swapping a photograph edits one word, and never has to know where the file
 * sits or what extension it carries.
 *
 * Files live under src/ rather than public/ because that is what lets Astro
 * resize them. A photograph in public/ is shipped untouched at full size.
 */
const FILES = import.meta.glob<{ default: ImageMetadata }>(
  "../../assets/photography/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  { eager: true },
);

/** "../../assets/photography/hero-denim-car.jpg" -> "hero-denim-car" */
const stemOf = (path: string): string => {
  const file = path.split("/").pop() ?? path;
  const dot = file.lastIndexOf(".");
  return dot === -1 ? file : file.slice(0, dot);
};

const BY_STEM = new Map<string, ImageMetadata>(
  Object.entries(FILES).map(([path, mod]) => [stemOf(path), mod.default]),
);

/**
 * Looks up a photograph by name. Accepts a bare stem, a filename, or a path,
 * so a value copied from anywhere still resolves.
 */
export function resolvePhoto(name: string): ImageMetadata | undefined {
  return BY_STEM.get(stemOf(name)) ?? BY_STEM.get(name);
}

/** Every photograph the bundler found, for diagnostics and tests. */
export function knownPhotographs(): string[] {
  return [...BY_STEM.keys()].sort();
}
