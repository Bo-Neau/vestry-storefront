import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { D as maybeRenderHead, E as renderTemplate, F as createAstro, b as renderComponent, k as addAttribute } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { t as $$Base } from "./Base_DvmQD7lT.mjs";
//#region src/components/NotFound.astro
createAstro("https://vestry.example");
var $$NotFound = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$NotFound;
	const { heading = "We can't find that page", message = "It may have moved, or the piece may no longer be in the range." } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="shell nf" data-astro-cid-zf75jdti><p class="label" data-astro-cid-zf75jdti>Error 404</p><h1 data-astro-cid-zf75jdti>${heading}</h1><p class="nf-msg" data-astro-cid-zf75jdti>${message}</p><nav aria-label="Suggested pages" data-astro-cid-zf75jdti><ul class="nf-links" data-astro-cid-zf75jdti>${[
		{
			href: "/collections/all",
			label: "Shop everything"
		},
		{
			href: "/collections/t-shirts",
			label: "T-shirts"
		},
		{
			href: "/collections/shirts",
			label: "Shirts"
		},
		{
			href: "/collections/knitwear",
			label: "Knitwear"
		},
		{
			href: "/collections/trousers",
			label: "Trousers"
		}
	].map((l) => renderTemplate`<li data-astro-cid-zf75jdti><a${addAttribute(l.href, "href")} data-astro-cid-zf75jdti>${l.label}</a></li>`)}</ul></nav></div>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/NotFound.astro", void 0);
//#endregion
//#region src/pages/404.astro
var _404_exports = /* @__PURE__ */ __exportAll({
	default: () => $$404,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://vestry.example");
var $$404 = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$404;
	Astro.response.status = 404;
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": "Page not found — Vestry",
		"description": "That page could not be found.",
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "NotFound", $$NotFound, {})}` })}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/404.astro", void 0);
var $$file = "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/404.astro";
var $$url = "/404";
//#endregion
//#region \0virtual:astro:page:src/pages/404@_@astro
var page = () => _404_exports;
//#endregion
export { page };
