import { ALL_IDENTIFIERS } from "./identifiers.ts";

/** Inline the identifier list so one round trip fetches every metafield. */
const IDENTIFIERS = ALL_IDENTIFIERS
  .map((id) => `{namespace:"${id.namespace}",key:"${id.key}"}`)
  .join(",");

/**
 * Fields shared by list and detail queries.
 *
 * `quantityAvailable` is the field the whole stock-aware filter depends on.
 * It returns null unless the app has the unauthenticated_read_product_inventory
 * scope — see docs/shopify-setup.md. A null here silently degrades filters, so
 * scripts/shopify-doctor.mjs checks for it explicitly.
 *
 * Option values carry `swatch { color }`, which is what makes connecting the
 * colour option to category metafield entries worthwhile: the hex comes from
 * Shopify instead of being duplicated in code.
 */
const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  options {
    name
    optionValues {
      name
      swatch { color }
    }
  }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  variants(first: 250) {
    nodes {
      id
      sku
      availableForSale
      quantityAvailable
      selectedOptions { name value }
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
    }
  }
  metafields(identifiers: [${IDENTIFIERS}]) {
    namespace
    key
    type
    value
    reference {
      ... on Metaobject {
        id
        handle
        type
        fields {
          key
          value
          references(first: 25) {
            nodes {
              ... on Metaobject {
                id
                type
                fields { key value }
              }
            }
          }
        }
      }
    }
    references(first: 25) {
      nodes {
        ... on Metaobject {
          id
          type
          fields { key value }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  query Products($first: Int!, $cursor: String) {
    products(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

/** Cheap connectivity probe for the doctor script. */
export const SHOP_QUERY = `
  query Shop {
    shop { name primaryDomain { url } }
  }
`;
