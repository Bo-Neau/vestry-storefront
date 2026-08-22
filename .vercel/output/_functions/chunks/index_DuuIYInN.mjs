import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { D as maybeRenderHead, E as renderTemplate, F as createAstro, b as renderComponent, x as Fragment } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { t as $$Base } from "./Base_DvmQD7lT.mjs";
import { n as loadProducts } from "./source_DNojBtZB.mjs";
import { a as websiteSchema, o as $$JsonLd, r as organisationSchema, s as $$ProductCard } from "./structured-data_BG3V5y0q.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
createAstro("https://vestry.example");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const { products } = await loadProducts();
	const featured = products.slice(0, 8);
	const siteOrigin = (Astro.site ?? new URL("https://vestry.example")).origin;
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": "Vestry — Considered basics, honestly sized",
		"description": "Organic cotton, merino and linen basics. Every product page tells you the model's height, the size they wore, and how the garment actually fits.",
		"data-astro-cid-lcdefpme": true
	}, {
		"default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="hero shell" data-astro-cid-lcdefpme><div class="hero-copy" data-astro-cid-lcdefpme><p class="label" data-astro-cid-lcdefpme>Autumn 2026</p><h1 data-astro-cid-lcdefpme>Clothes that tell you how they fit.</h1><p class="hero-lede" data-astro-cid-lcdefpme>Every product page carries the model's height, the size they wore, and garment measurements laid flat — so you can judge fit before it arrives, not after.</p><div class="hero-actions" data-astro-cid-lcdefpme><a href="/collections/all" class="btn" data-astro-cid-lcdefpme>Shop everything</a><a href="/collections/knitwear" class="btn ghost" data-astro-cid-lcdefpme>New knitwear</a></div></div></section><section class="shell trust" data-astro-cid-lcdefpme><div class="trust-item" data-astro-cid-lcdefpme><h2 data-astro-cid-lcdefpme>Measured, not guessed</h2><p data-astro-cid-lcdefpme>Garment measurements laid flat for every size, with instructions for taking your own.</p></div><div class="trust-item" data-astro-cid-lcdefpme><h2 data-astro-cid-lcdefpme>Fit data in every review</h2><p data-astro-cid-lcdefpme>Reviewers tell you their height and the size they bought. We publish the critical ones too.</p></div><div class="trust-item" data-astro-cid-lcdefpme><h2 data-astro-cid-lcdefpme>Free returns for 30 days</h2><p data-astro-cid-lcdefpme>Exchanges are one step. If the size is wrong, swapping it should be easy.</p></div></section><section class="shell featured" data-astro-cid-lcdefpme><div class="featured-head" data-astro-cid-lcdefpme><h2 data-astro-cid-lcdefpme>Selected styles</h2><a href="/collections/all" class="more" data-astro-cid-lcdefpme>All twelve styles</a></div><ul class="grid" data-astro-cid-lcdefpme>${featured.map((product, i) => renderTemplate`<li data-astro-cid-lcdefpme>${renderComponent($$result, "ProductCard", $$ProductCard, {
			"product": product,
			"loading": i < 4 ? "eager" : "lazy",
			"data-astro-cid-lcdefpme": true
		})}</li>`)}</ul></section>`,
		"head": ($$result) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "slot": "head" }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "JsonLd", $$JsonLd, {
			"data": organisationSchema(siteOrigin, "Vestry"),
			"data-astro-cid-lcdefpme": true
		})}${renderComponent($$result, "JsonLd", $$JsonLd, {
			"data": websiteSchema(siteOrigin, "Vestry"),
			"data-astro-cid-lcdefpme": true
		})}` })}`
	})}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/index.astro", void 0);
var $$file = "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
