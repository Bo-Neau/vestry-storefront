import type { Product } from "../../data/schema.ts";
import { SIZE_ORDER, hasStock, averageRating, totalInventory } from "../../data/schema.ts";

/**
 * schema.org JSON-LD.
 *
 * Two rules that keep this honest, and keep Google from penalising the site:
 *
 *  - `availability` reflects REAL stock. Advertising InStock for a sold-out
 *    product earns a manual action, and more importantly it lands the shopper
 *    on a dead end straight from a search result.
 *  - `aggregateRating` is emitted ONLY when reviews actually exist. Marking up
 *    a rating with nothing behind it is the most common structured-data
 *    penalty in ecommerce.
 */

const SCHEMA = "https://schema.org";

export function productSchema(product: Product, url: string, siteName: string) {
  const rating = averageRating(product);
  const inStock = totalInventory(product) > 0;

  const offers = product.colorways.flatMap((colorway) =>
    colorway.sizes.map((stock) => ({
      "@type": "Offer",
      name: `${colorway.name} / ${stock.size}`,
      price: (product.price.amount / 100).toFixed(2),
      priceCurrency: product.price.currency,
      // Honest per-variant availability.
      availability: `${SCHEMA}/${stock.inventory > 0 ? "InStock" : "OutOfStock"}`,
      itemCondition: `${SCHEMA}/NewCondition`,
      url: `${url}?color=${colorway.id}`,
    })),
  );

  return {
    "@context": SCHEMA,
    "@type": "Product",
    name: product.title,
    description: product.summary,
    sku: product.id,
    url,
    brand: { "@type": "Brand", name: siteName },
    material: product.attributes.fabric,
    audience: {
      "@type": "PeopleAudience",
      suggestedGender: product.attributes.targetGender.toLowerCase(),
    },
    size: SIZE_ORDER.filter((s) => hasStock(product, s)),
    color: product.colorways.map((c) => c.name),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.price.currency,
      lowPrice: (product.price.amount / 100).toFixed(2),
      highPrice: ((product.compareAtPrice?.amount ?? product.price.amount) / 100).toFixed(2),
      offerCount: offers.length,
      availability: `${SCHEMA}/${inStock ? "InStock" : "OutOfStock"}`,
      offers,
    },
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount: product.reviews.length,
            bestRating: "5",
            worstRating: "1",
          },
          review: product.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            name: r.title,
            reviewBody: r.body,
            reviewRating: {
              "@type": "Rating",
              ratingValue: String(r.rating),
              bestRating: "5",
              worstRating: "1",
            },
          })),
        }
      : {}),
  };
}

export function breadcrumbSchema(trail: readonly { name: string; url: string }[]) {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organisationSchema(siteUrl: string, siteName: string) {
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
  };
}

export function websiteSchema(siteUrl: string, siteName: string) {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };
}

export function collectionSchema(
  name: string, description: string, url: string,
  products: readonly Product[], siteUrl: string,
) {
  return {
    "@context": SCHEMA,
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/products/${p.handle}`,
        name: p.title,
      })),
    },
  };
}
