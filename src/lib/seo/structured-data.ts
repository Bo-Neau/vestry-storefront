import type { Design, Designer } from "../../data/journal.ts";

/* ---------------------------------------------------------------
   Structured data for a journal.

   The storefront emitted Product schema with offers, price and
   availability. None of that is true any more — Manussa is not
   selling — and a Product/Offer with no price is the kind of thing
   that earns a rich-result penalty rather than a rich result.

   So: CreativeWork for a piece, Person for a designer, and
   CollectionPage for a collection. All three are honest about what
   this site actually is.
   --------------------------------------------------------------- */

const absolute = (siteUrl: string, path: string): string =>
  new URL(path, siteUrl).href;

/**
 * A garment presented as a work rather than a product.
 *
 * `creator` carries the designer and, separately, the painter — the two are
 * different people on the painted pieces and flattening them would drop a
 * credit the booklet makes explicitly.
 */
export function designSchema(
  design: Design,
  url: string,
  siteUrl: string,
  siteName: string,
) {
  const creators = [
    { "@type": "Person", name: design.designer },
    ...(design.artist ? [{ "@type": "Person", name: design.artist }] : []),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: design.title,
    headline: design.title,
    description: design.summary,
    url,
    creator: creators,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: design.collection,
    },
    material: design.fabric,
    image: design.images.map((i) => absolute(siteUrl, i.src)),
    publisher: { "@type": "Organization", name: siteName },
  };
}

/**
 * A credited person. States only what the booklet states.
 *
 * No list of works here: each piece already declares this person as its
 * `creator`, and that is the direction search engines follow. Repeating the
 * list on the Person would be asserting the same edge twice, in a property
 * that does not mean "made these".
 */
export function designerSchema(
  designer: Designer,
  url: string,
  siteName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: designer.name,
    url,
    ...(designer.role ? { jobTitle: designer.role } : {}),
    ...(designer.bio ? { description: designer.bio } : {}),
    worksFor: { "@type": "Organization", name: siteName },
  };
}

export function breadcrumbSchema(trail: readonly { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: step.url,
    })),
  };
}

export function organisationSchema(siteUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absolute(siteUrl, "/brand/logo-mark.png"),
  };
}

export function websiteSchema(siteUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };
}

/** A collection page listing the pieces it contains, in order. */
export function collectionSchema(
  title: string,
  description: string,
  url: string,
  siteUrl: string,
  designs: readonly Design[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: designs.length,
      itemListElement: designs.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(siteUrl, `/pieces/${d.handle}`),
        name: d.title,
      })),
    },
  };
}
