/**
 * Image CDN abstraction.
 *
 * Default is the platform CDN (Shopify), because it is free, already holds
 * the images, and adds no third-party host. The research is explicit on this:
 * start with the platform CDN and only reach for Cloudinary or imgix when you
 * need DAM workflows or deep zoom. Fashion already has the worst Core Web
 * Vitals pass rate in retail; adding a host to serve images you are already
 * being served is a poor trade.
 *
 * Swapping provider changes this file and nothing else.
 */

export type ImageProvider = "shopify" | "cloudinary" | "imgix" | "passthrough";
export type ImageFormat = "avif" | "webp" | "jpg";

export interface ImageConfig {
  readonly provider: ImageProvider;
  /** Cloudinary cloud name, or imgix subdomain. Unused for shopify. */
  readonly account?: string | undefined;
}

function read(key: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)?.[key];
  const v = (fromProcess ?? fromMeta ?? "").trim();
  return v.length > 0 ? v : undefined;
}

export function imageConfig(): ImageConfig {
  const provider = (read("IMAGE_PROVIDER") ?? "shopify") as ImageProvider;
  return { provider, account: read("IMAGE_ACCOUNT") };
}

/**
 * Widths generated for srcset.
 *
 * Capped at 2048 because that is the master size the research calls for —
 * enough for zoom and retina without shipping bytes nobody sees. The small
 * end matters more than it looks: a 3-across mobile grid asks for ~180px
 * images, and serving 1200px there is the single most common cause of a slow
 * fashion collection page.
 */
export const SRCSET_WIDTHS = [200, 320, 480, 640, 900, 1200, 1600, 2048] as const;

/** Order matters: browsers take the first <source> they support. */
export const FORMAT_PREFERENCE: readonly ImageFormat[] = ["avif", "webp"];

const CONTENT_TYPE: Record<ImageFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
};

export const mimeFor = (format: ImageFormat): string => CONTENT_TYPE[format];

/* ---------------- per-provider URL building ---------------- */

/**
 * A CDN can only transform images it actually hosts.
 *
 * Relative paths are served by this app, and absolute URLs on other hosts
 * belong to someone else. Rewriting either onto a CDN produces a URL that
 * 404s — which is exactly what happened the first time this shipped: a local
 * /sample/*.png was rewritten to cdn.shopify.com and quietly broke.
 *
 * Passing through is always safe; rewriting is not.
 */
function isRelative(src: string): boolean {
  return !/^https?:\/\//i.test(src);
}

const SHOPIFY_CDN_HOSTS = ["cdn.shopify.com", "cdn.shopifycdn.net"];

function isShopifyHosted(src: string): boolean {
  if (isRelative(src)) return false;
  try {
    return SHOPIFY_CDN_HOSTS.some((h) => new URL(src).hostname.endsWith(h));
  } catch {
    return false;
  }
}

function shopifyUrl(src: string, width: number, format: ImageFormat): string {
  // Only Shopify-hosted images. Anything else is served as-is.
  if (!isShopifyHosted(src)) return src;
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  if (format !== "jpg") url.searchParams.set("format", format);
  return url.toString();
}

function cloudinaryUrl(
  src: string, width: number, format: ImageFormat, account: string | undefined,
): string {
  // fetch mode needs an absolute URL it can reach.
  if (!account || isRelative(src)) return src;
  // f_auto/q_auto let Cloudinary pick, but we ask explicitly so the <source>
  // type attribute and the delivered bytes cannot disagree.
  const transform = `f_${format},q_auto,w_${width},c_limit,dpr_auto`;
  const encoded = encodeURIComponent(src);
  return `https://res.cloudinary.com/${account}/image/fetch/${transform}/${encoded}`;
}

function imgixUrl(
  src: string, width: number, format: ImageFormat, account: string | undefined,
): string {
  if (!account || isRelative(src)) return src;
  const path = src.replace(/^https?:\/\/[^/]+/, "");
  const url = new URL(path, `https://${account}.imgix.net`);
  url.searchParams.set("w", String(width));
  url.searchParams.set("fm", format);
  url.searchParams.set("auto", "compress");
  url.searchParams.set("fit", "max");
  return url.toString();
}

export { isRelative, isShopifyHosted };

/**
 * Whether this provider can actually resize and re-encode this source.
 *
 * When it cannot, the caller must emit a plain <img> — NOT a <picture> with
 * format sources and a multi-width srcset. Advertising six widths for one
 * file, or labelling a PNG as image/avif, is lying to the browser: it will
 * either mis-select a candidate or fail to decode a source it was told it
 * could handle.
 */
export function canTransform(src: string, config = imageConfig()): boolean {
  switch (config.provider) {
    case "shopify":     return isShopifyHosted(src);
    case "cloudinary":  return Boolean(config.account) && !isRelative(src);
    case "imgix":       return Boolean(config.account) && !isRelative(src);
    case "passthrough": return false;
  }
}

export function buildUrl(
  src: string, width: number, format: ImageFormat, config = imageConfig(),
): string {
  switch (config.provider) {
    case "shopify":     return shopifyUrl(src, width, format);
    case "cloudinary":  return cloudinaryUrl(src, width, format, config.account);
    case "imgix":       return imgixUrl(src, width, format, config.account);
    case "passthrough": return src;
  }
}

/**
 * srcset capped at the image's intrinsic width — upscaling ships bytes that
 * carry no extra detail.
 */
export function buildSrcset(
  src: string, format: ImageFormat, intrinsicWidth: number, config = imageConfig(),
): string {
  const widths: number[] = SRCSET_WIDTHS.filter((w) => w <= intrinsicWidth);
  // A very small source still needs one candidate, at its own width.
  if (widths.length === 0) widths.push(intrinsicWidth);
  return widths
    .map((w) => `${buildUrl(src, w, format, config)} ${w}w`)
    .join(", ");
}
