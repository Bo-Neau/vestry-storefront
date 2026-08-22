import { D as maybeRenderHead, E as renderTemplate, F as createAstro, N as unescapeHTML, b as renderComponent, k as addAttribute } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { a as averageRating, i as SIZE_ORDER, l as totalInventory, s as hasStock } from "./source_DNojBtZB.mjs";
import { n as formatMoney, r as $$Garment, t as discountPercent } from "./money_DAFvxNYY.mjs";
//#region src/lib/images/provider.ts
function read(key) {
	const fromProcess = typeof process !== "undefined" ? process.env?.[key] : void 0;
	const fromMeta = Object.assign({
		"ASSETS_PREFIX": void 0,
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SITE": "https://vestry.example",
		"SSR": true
	}, { _: "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/node_modules/.bin/astro" })?.[key];
	const v = (fromProcess ?? fromMeta ?? "").trim();
	return v.length > 0 ? v : void 0;
}
function imageConfig() {
	return {
		provider: read("IMAGE_PROVIDER") ?? "shopify",
		account: read("IMAGE_ACCOUNT")
	};
}
var SRCSET_WIDTHS = [
	200,
	320,
	480,
	640,
	900,
	1200,
	1600,
	2048
];
var FORMAT_PREFERENCE = ["avif", "webp"];
var CONTENT_TYPE = {
	avif: "image/avif",
	webp: "image/webp",
	jpg: "image/jpeg"
};
var mimeFor = (format) => CONTENT_TYPE[format];
function isRelative(src) {
	return !/^https?:\/\//i.test(src);
}
var SHOPIFY_CDN_HOSTS = ["cdn.shopify.com", "cdn.shopifycdn.net"];
function isShopifyHosted(src) {
	if (isRelative(src)) return false;
	try {
		return SHOPIFY_CDN_HOSTS.some((h) => new URL(src).hostname.endsWith(h));
	} catch {
		return false;
	}
}
function shopifyUrl(src, width, format) {
	if (!isShopifyHosted(src)) return src;
	const url = new URL(src);
	url.searchParams.set("width", String(width));
	if (format !== "jpg") url.searchParams.set("format", format);
	return url.toString();
}
function cloudinaryUrl(src, width, format, account) {
	if (!account || isRelative(src)) return src;
	return `https://res.cloudinary.com/${account}/image/fetch/${`f_${format},q_auto,w_${width},c_limit,dpr_auto`}/${encodeURIComponent(src)}`;
}
function imgixUrl(src, width, format, account) {
	if (!account || isRelative(src)) return src;
	const path = src.replace(/^https?:\/\/[^/]+/, "");
	const url = new URL(path, `https://${account}.imgix.net`);
	url.searchParams.set("w", String(width));
	url.searchParams.set("fm", format);
	url.searchParams.set("auto", "compress");
	url.searchParams.set("fit", "max");
	return url.toString();
}
function canTransform(src, config = imageConfig()) {
	switch (config.provider) {
		case "shopify": return isShopifyHosted(src);
		case "cloudinary": return Boolean(config.account) && !isRelative(src);
		case "imgix": return Boolean(config.account) && !isRelative(src);
		case "passthrough": return false;
	}
}
function buildUrl(src, width, format, config = imageConfig()) {
	switch (config.provider) {
		case "shopify": return shopifyUrl(src, width, format);
		case "cloudinary": return cloudinaryUrl(src, width, format, config.account);
		case "imgix": return imgixUrl(src, width, format, config.account);
		case "passthrough": return src;
	}
}
function buildSrcset(src, format, intrinsicWidth, config = imageConfig()) {
	const widths = SRCSET_WIDTHS.filter((w) => w <= intrinsicWidth);
	if (widths.length === 0) widths.push(intrinsicWidth);
	return widths.map((w) => `${buildUrl(src, w, format, config)} ${w}w`).join(", ");
}
//#endregion
//#region src/components/ProductImage.astro
createAstro("https://vestry.example");
var $$ProductImage = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ProductImage;
	const { colorway, shape, view, alt, sizes, priority = false } = Astro.props;
	const image = colorway.images?.find((i) => i.view === view);
	const transformable = image ? canTransform(image.src) : false;
	return renderTemplate`${image && transformable ? renderTemplate`${maybeRenderHead($$result)}<picture data-astro-cid-pkoz2y7j>${FORMAT_PREFERENCE.map((format) => renderTemplate`<source${addAttribute(mimeFor(format), "type")}${addAttribute(buildSrcset(image.src, format, image.width), "srcset")}${addAttribute(sizes, "sizes")} data-astro-cid-pkoz2y7j>`)}<img${addAttribute(buildUrl(image.src, 900, "jpg"), "src")}${addAttribute(buildSrcset(image.src, "jpg", image.width), "srcset")}${addAttribute(sizes, "sizes")}${addAttribute(image.width, "width")}${addAttribute(image.height, "height")}${addAttribute(alt, "alt")}${addAttribute(priority ? "eager" : "lazy", "loading")}${addAttribute(priority ? "high" : "auto", "fetchpriority")}${addAttribute(priority ? "sync" : "async", "decoding")} class="product-img" data-astro-cid-pkoz2y7j></picture>` : image ? renderTemplate`<img${addAttribute(image.src, "src")}${addAttribute(image.width, "width")}${addAttribute(image.height, "height")}${addAttribute(alt, "alt")}${addAttribute(priority ? "eager" : "lazy", "loading")}${addAttribute(priority ? "high" : "auto", "fetchpriority")}${addAttribute(priority ? "sync" : "async", "decoding")} class="product-img" data-astro-cid-pkoz2y7j>` : renderTemplate`${renderComponent($$result, "Garment", $$Garment, {
		"shape": shape,
		"hex": colorway.hex,
		"hexAlt": colorway.hexAlt,
		"view": view,
		"alt": alt,
		"loading": priority ? "eager" : "lazy",
		"data-astro-cid-pkoz2y7j": true
	})}`}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/ProductImage.astro", void 0);
//#endregion
//#region src/components/ProductCard.astro
createAstro("https://vestry.example");
var $$ProductCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ProductCard;
	const { product, loading = "lazy" } = Astro.props;
	const lead = product.colorways[0];
	const inStock = SIZE_ORDER.filter((s) => hasStock(product, s));
	const soldOut = SIZE_ORDER.filter((s) => !hasStock(product, s));
	const rating = averageRating(product);
	const off = product.compareAtPrice ? discountPercent(product.price, product.compareAtPrice) : 0;
	return renderTemplate`${maybeRenderHead($$result)}<article class="card" data-astro-cid-4fhpls6h><div class="card-media" data-astro-cid-4fhpls6h>${renderComponent($$result, "ProductImage", $$ProductImage, {
		"colorway": lead,
		"shape": product.shape,
		"view": "front",
		"alt": "",
		"priority": loading === "eager",
		"sizes": "(max-width: 860px) 45vw, (max-width: 1320px) 24vw, 300px",
		"data-astro-cid-4fhpls6h": true
	})}${off > 0 && renderTemplate`<span class="flag" data-astro-cid-4fhpls6h>${off}% off</span>`}</div><div class="card-body" data-astro-cid-4fhpls6h><h3 class="card-title" data-astro-cid-4fhpls6h><a${addAttribute(`/products/${product.handle}`, "href")} data-astro-cid-4fhpls6h>${product.title}</a></h3><p class="card-price money" data-astro-cid-4fhpls6h>${formatMoney(product.price)}${product.compareAtPrice && renderTemplate`<s class="was" data-astro-cid-4fhpls6h>${formatMoney(product.compareAtPrice)}</s>`}</p><p class="card-meta" data-astro-cid-4fhpls6h>${product.attributes.fit} fit · ${product.attributes.fabricWeightGsm}gsm${product.reviews.length > 0 && renderTemplate`<span class="rating" data-astro-cid-4fhpls6h>${" · "}${rating.toFixed(1)}<span class="sr-only" data-astro-cid-4fhpls6h> out of 5 from ${product.reviews.length} reviews</span><span aria-hidden="true" data-astro-cid-4fhpls6h> (${product.reviews.length})</span></span>`}</p><!-- Swatches carry a visible name in the tooltip AND a text list below,
        because a colour chip alone is ambiguous on textured fabric. --><ul class="swatches"${addAttribute(`${product.colorways.length} colours available`, "aria-label")} data-astro-cid-4fhpls6h>${product.colorways.map((c) => renderTemplate`<li data-astro-cid-4fhpls6h><span class="swatch"${addAttribute(`--a: ${c.hex}; --b: ${c.hexAlt ?? c.hex};`, "style")}${addAttribute(c.name, "title")} data-astro-cid-4fhpls6h></span><span class="sr-only" data-astro-cid-4fhpls6h>${c.name}</span></li>`)}</ul><!-- Sizes in stock, stated plainly. Sold-out sizes are struck through
        rather than hidden, so absence is legible instead of confusing. --><p class="sizes" data-astro-cid-4fhpls6h>${SIZE_ORDER.map((s) => renderTemplate`<span${addAttribute(hasStock(product, s) ? "sz" : "sz out", "class")} data-astro-cid-4fhpls6h>${s}</span>`)}${inStock.length === 0 && renderTemplate`<span class="all-out" data-astro-cid-4fhpls6h>Sold out</span>`}</p>${soldOut.length > 0 && inStock.length > 0 && renderTemplate`<p class="sr-only" data-astro-cid-4fhpls6h>Sold out in ${soldOut.join(", ")}.</p>`}</div></article>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/ProductCard.astro", void 0);
//#endregion
//#region src/components/JsonLd.astro
createAstro("https://vestry.example");
var $$JsonLd = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$JsonLd;
	const { data } = Astro.props;
	const json = JSON.stringify(data).replace(/</g, "\\u003c");
	return renderTemplate`<script type="application/ld+json">${unescapeHTML(json)}<\/script>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/JsonLd.astro", void 0);
//#endregion
//#region src/lib/seo/structured-data.ts
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
var SCHEMA = "https://schema.org";
function productSchema(product, url, siteName) {
	const rating = averageRating(product);
	const inStock = totalInventory(product) > 0;
	const offers = product.colorways.flatMap((colorway) => colorway.sizes.map((stock) => ({
		"@type": "Offer",
		name: `${colorway.name} / ${stock.size}`,
		price: (product.price.amount / 100).toFixed(2),
		priceCurrency: product.price.currency,
		availability: `${SCHEMA}/${stock.inventory > 0 ? "InStock" : "OutOfStock"}`,
		itemCondition: `${SCHEMA}/NewCondition`,
		url: `${url}?color=${colorway.id}`
	})));
	return {
		"@context": SCHEMA,
		"@type": "Product",
		name: product.title,
		description: product.summary,
		sku: product.id,
		url,
		brand: {
			"@type": "Brand",
			name: siteName
		},
		material: product.attributes.fabric,
		audience: {
			"@type": "PeopleAudience",
			suggestedGender: product.attributes.targetGender.toLowerCase()
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
			offers
		},
		...product.reviews.length > 0 ? {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: rating.toFixed(1),
				reviewCount: product.reviews.length,
				bestRating: "5",
				worstRating: "1"
			},
			review: product.reviews.slice(0, 5).map((r) => ({
				"@type": "Review",
				author: {
					"@type": "Person",
					name: r.author
				},
				datePublished: r.date,
				name: r.title,
				reviewBody: r.body,
				reviewRating: {
					"@type": "Rating",
					ratingValue: String(r.rating),
					bestRating: "5",
					worstRating: "1"
				}
			}))
		} : {}
	};
}
function breadcrumbSchema(trail) {
	return {
		"@context": SCHEMA,
		"@type": "BreadcrumbList",
		itemListElement: trail.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: item.url
		}))
	};
}
function organisationSchema(siteUrl, siteName) {
	return {
		"@context": SCHEMA,
		"@type": "Organization",
		name: siteName,
		url: siteUrl,
		logo: `${siteUrl}/favicon.svg`
	};
}
function websiteSchema(siteUrl, siteName) {
	return {
		"@context": SCHEMA,
		"@type": "WebSite",
		name: siteName,
		url: siteUrl
	};
}
function collectionSchema(name, description, url, products, siteUrl) {
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
				name: p.title
			}))
		}
	};
}
//#endregion
export { websiteSchema as a, $$ProductImage as c, productSchema as i, collectionSchema as n, $$JsonLd as o, organisationSchema as r, $$ProductCard as s, breadcrumbSchema as t };
