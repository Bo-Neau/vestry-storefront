import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { D as maybeRenderHead, E as renderTemplate, F as createAstro, b as renderComponent } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { t as $$Base } from "./Base_DvmQD7lT.mjs";
//#region src/pages/500.astro
var _500_exports = /* @__PURE__ */ __exportAll({
	default: () => $$500,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://vestry.example");
var $$500 = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$500;
	Astro.response.status = 500;
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": "Something went wrong — Vestry",
		"description": "An unexpected error occurred.",
		"noindex": true,
		"data-astro-cid-qnkxrarz": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="shell err" data-astro-cid-qnkxrarz><p class="label" data-astro-cid-qnkxrarz>Error 500</p><h1 data-astro-cid-qnkxrarz>Something went wrong at our end</h1><p class="err-msg" data-astro-cid-qnkxrarz>This one is on us, not you. Try again in a moment — if it keeps happening, your bag is saved and nothing has been charged.</p><div class="err-actions" data-astro-cid-qnkxrarz><a href="/" class="btn" data-astro-cid-qnkxrarz>Back to home</a><a href="/cart" class="btn ghost" data-astro-cid-qnkxrarz>View your bag</a></div></div>` })}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/500.astro", void 0);
var $$file = "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/500.astro";
var $$url = "/500";
//#endregion
//#region \0virtual:astro:page:src/pages/500@_@astro
var page = () => _500_exports;
//#endregion
export { page };
