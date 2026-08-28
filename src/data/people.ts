import type { Designer } from "./journal.ts";
import { DESIGNS } from "./designs.ts";
import { slugify } from "./journal.ts";

/**
 * The people credited in the booklet.
 *
 * Bios are absent on purpose. I do not know these people, and a profile page
 * carrying an invented biography of a real person is worse than one carrying
 * none — the pages are built to read properly from the work alone, and to
 * gain a paragraph the moment the client writes one.
 *
 * `role` is the exception: it is derived from the credits themselves rather
 * than guessed, so it states only what the booklet already says.
 */
export const DESIGNERS: readonly Designer[] = [
  { slug: "katherine-paing",  name: "Katherine Paing" },
  { slug: "ei-ko-zin-latt",   name: "Ei Ko Zin Latt" },
  { slug: "pan-ywal-oo",      name: "Pan Ywal Oo" },
  { slug: "sa-thaw-zin-hut",  name: "Sa Thaw Zin Hut" },
  { slug: "kay",              name: "Kay" },
  { slug: "sandi",            name: "Sandi" },
  { slug: "win-min-than",     name: "Win Min Than", role: "Painter" },
];

export const designerBySlug = (slug: string): Designer | undefined =>
  DESIGNERS.find((d) => d.slug === slug);

export const designerByName = (name: string): Designer | undefined =>
  DESIGNERS.find((d) => d.name === name);

/** Pieces this person cut and designed. */
export const designedBy = (designer: Designer) =>
  DESIGNS.filter((d) => slugify(d.designer) === designer.slug);

/** Pieces this person painted, which is a separate credit from designing. */
export const paintedBy = (designer: Designer) =>
  DESIGNS.filter((d) => d.artist && slugify(d.artist) === designer.slug);

/** Everything a person is credited on, without listing a piece twice. */
export const workBy = (designer: Designer) => {
  const seen = new Set<string>();
  return [...designedBy(designer), ...paintedBy(designer)].filter((d) => {
    if (seen.has(d.handle)) return false;
    seen.add(d.handle);
    return true;
  });
};

/** Only people with work to show. Guards against an orphaned profile page. */
export const CREDITED = DESIGNERS.filter((d) => workBy(d).length > 0);
