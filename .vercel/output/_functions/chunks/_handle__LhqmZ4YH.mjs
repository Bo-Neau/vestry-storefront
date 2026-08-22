import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { D as maybeRenderHead, E as renderTemplate, F as createAstro, b as renderComponent, k as addAttribute, x as Fragment } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { t as $$Base } from "./Base_DvmQD7lT.mjs";
import { i as SIZE_ORDER, n as loadProducts, s as hasStock } from "./source_DNojBtZB.mjs";
import { n as collectionSchema, o as $$JsonLd, s as $$ProductCard, t as breadcrumbSchema } from "./structured-data_BG3V5y0q.mjs";
//#region src/lib/facets.ts
var FACET_KEYS = [
	"category",
	"fit",
	"neckline",
	"sleeve",
	"gender",
	"size",
	"color"
];
/** Values a product presents for a given facet. */
function valuesFor(p, key) {
	switch (key) {
		case "category": return [p.category];
		case "fit": return [p.attributes.fit];
		case "neckline": return p.attributes.neckline ? [p.attributes.neckline] : [];
		case "sleeve": return p.attributes.sleeveLength ? [p.attributes.sleeveLength] : [];
		case "gender": return [p.attributes.targetGender];
		case "size": return SIZE_ORDER.filter((s) => hasStock(p, s));
		case "color": return p.colorways.map((c) => c.name);
	}
}
function matchesGroup(p, key, selected) {
	if (selected.length === 0) return true;
	const values = valuesFor(p, key);
	return selected.some((sel) => values.includes(sel));
}
/** AND across groups, OR within each group. */
function applyFilters(products, filters) {
	return products.filter((p) => FACET_KEYS.every((key) => matchesGroup(p, key, filters[key])));
}
/**
* Count for one option = products matching every OTHER group, plus this
* option. So counts stay meaningful after the first selection.
*/
function facetOptions(products, filters, key, ordered) {
	const otherGroups = FACET_KEYS.filter((k) => k !== key);
	const base = products.filter((p) => otherGroups.every((k) => matchesGroup(p, k, filters[k])));
	const counts = /* @__PURE__ */ new Map();
	for (const p of base) for (const v of valuesFor(p, key)) counts.set(v, (counts.get(v) ?? 0) + 1);
	for (const sel of filters[key]) if (!counts.has(sel)) counts.set(sel, 0);
	return (ordered ? ordered.filter((v) => counts.has(v)) : [...counts.keys()].sort((a, b) => a.localeCompare(b))).map((value) => ({
		value,
		count: counts.get(value) ?? 0,
		selected: filters[key].includes(value)
	}));
}
/** Filters live in the URL, so results are shareable and need no JS. */
function filtersFromParams(params) {
	const next = {
		category: [],
		fit: [],
		neckline: [],
		sleeve: [],
		gender: [],
		size: [],
		color: []
	};
	for (const key of FACET_KEYS) next[key] = params.getAll(key).filter((v) => v.length > 0);
	return next;
}
function countActive(filters) {
	return FACET_KEYS.reduce((n, k) => n + filters[k].length, 0);
}
/** Href with one option toggled — plain links, so filters work without JS. */
function toggleHref(basePath, filters, key, value) {
	const params = new URLSearchParams();
	for (const k of FACET_KEYS) {
		const values = k === key ? filters[k].includes(value) ? filters[k].filter((v) => v !== value) : [...filters[k], value] : filters[k];
		for (const v of values) params.append(k, v);
	}
	const qs = params.toString();
	return qs ? `${basePath}?${qs}` : basePath;
}
//#endregion
//#region src/components/FilterPanel.astro
createAstro("https://vestry.example");
var $$FilterPanel = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$FilterPanel;
	const { facets, filters, basePath, resultCount } = Astro.props;
	const GROUPS = [
		{
			key: "size",
			label: "Size"
		},
		{
			key: "fit",
			label: "Fit"
		},
		{
			key: "neckline",
			label: "Neckline"
		},
		{
			key: "sleeve",
			label: "Sleeve length"
		},
		{
			key: "color",
			label: "Colour"
		},
		{
			key: "gender",
			label: "Cut for"
		}
	];
	const active = countActive(filters);
	return renderTemplate`${maybeRenderHead($$result)}<aside class="filters" aria-label="Filter products" data-astro-cid-swcd4qks><div class="filters-head" data-astro-cid-swcd4qks><h2 class="label" data-astro-cid-swcd4qks>Filter</h2><p class="count" aria-live="polite" data-astro-cid-swcd4qks>${resultCount} ${resultCount === 1 ? "style" : "styles"}</p></div>${active > 0 && renderTemplate`<a${addAttribute(basePath, "href")} class="clear" data-astro-cid-swcd4qks>Clear all ${active}</a>`}${GROUPS.map((group) => {
		const options = facets[group.key] ?? [];
		if (options.length === 0) return null;
		return renderTemplate`<section class="group" data-astro-cid-swcd4qks><h3 class="group-title" data-astro-cid-swcd4qks>${group.label}</h3><ul class="options" data-astro-cid-swcd4qks>${options.map((opt) => renderTemplate`<li data-astro-cid-swcd4qks><a${addAttribute(toggleHref(basePath, filters, group.key, opt.value), "href")}${addAttribute(["opt", {
			on: opt.selected,
			empty: opt.count === 0
		}], "class:list")}${addAttribute(opt.selected ? "true" : "false", "aria-pressed")} rel="nofollow" data-astro-cid-swcd4qks><span class="box" aria-hidden="true" data-astro-cid-swcd4qks></span><span class="val" data-astro-cid-swcd4qks>${opt.value}</span><span class="n" data-astro-cid-swcd4qks>${opt.count}</span></a></li>`)}</ul></section>`;
	})}<p class="honest" data-astro-cid-swcd4qks>Size counts reflect what is in stock right now, not what the style was made in.</p></aside>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/FilterPanel.astro", void 0);
//#endregion
//#region src/lib/search/document.ts
/** Facet key in our URLs -> field name in the index. */
var FACET_FIELD = {
	category: "category",
	fit: "fit",
	neckline: "neckline",
	sleeve: "sleeve",
	gender: "gender",
	color: "colours",
	size: "sizes_in_stock"
};
//#endregion
//#region src/lib/search/typesense.ts
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
function typesenseConfig() {
	const url = read("TYPESENSE_URL");
	const apiKey = read("TYPESENSE_SEARCH_KEY");
	if (!url || !apiKey) return null;
	if (read("TYPESENSE_ADMIN_KEY") && apiKey === read("TYPESENSE_ADMIN_KEY")) throw new Error("TYPESENSE_SEARCH_KEY is the same value as TYPESENSE_ADMIN_KEY. Use a search-only key for queries — an admin key can drop the collection. Create one with `npm run search:keys`.");
	return {
		url: url.replace(/\/+$/, ""),
		apiKey,
		collection: read("TYPESENSE_COLLECTION") ?? "products"
	};
}
var isSearchConfigured = () => {
	try {
		return typesenseConfig() !== null;
	} catch {
		return true;
	}
};
var escapeValue = (v) => `\`${v.replace(/`/g, "")}\``;
function filterClause(key, values) {
	if (values.length === 0) return null;
	const field = FACET_FIELD[key];
	if (!field) return null;
	return `${field}:=[${values.map(escapeValue).join(",")}]`;
}
function buildFilter(filters, skip) {
	const clauses = [];
	for (const key of FACET_KEYS) {
		if (key === skip) continue;
		const clause = filterClause(key, filters[key]);
		if (clause) clauses.push(clause);
	}
	return clauses.join(" && ");
}
var join = (...parts) => parts.filter((p) => Boolean(p && p.length > 0)).join(" && ");
async function search(req) {
	const config = typesenseConfig();
	if (!config) throw new Error("Typesense is not configured. See .env.example.");
	const facetFields = FACET_KEYS.map((k) => FACET_FIELD[k]).filter(Boolean).join(",");
	const common = {
		collection: config.collection,
		q: req.query && req.query.length > 0 ? req.query : "*",
		query_by: "title,summary,fabric,colours",
		facet_by: facetFields,
		max_facet_values: 50,
		per_page: req.perPage ?? 60
	};
	const searches = [{
		...common,
		filter_by: join(req.scope, buildFilter(req.filters))
	}];
	const facetOrder = [];
	for (const key of FACET_KEYS) {
		if (req.filters[key].length === 0) continue;
		facetOrder.push(key);
		searches.push({
			...common,
			filter_by: join(req.scope, buildFilter(req.filters, key)),
			facet_by: FACET_FIELD[key],
			per_page: 0
		});
	}
	const res = await fetch(`${config.url}/multi_search`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-TYPESENSE-API-KEY": config.apiKey
		},
		body: JSON.stringify({ searches })
	});
	if (res.status === 401 || res.status === 403) throw new Error("Typesense rejected the key. Check TYPESENSE_SEARCH_KEY.");
	if (!res.ok) throw new Error(`Typesense HTTP ${res.status}: ${await res.text().catch(() => "")}`);
	const body = await res.json();
	const primary = body.results[0];
	if (!primary || primary.error) throw new Error(`Typesense search failed: ${primary?.error ?? "no result"}`);
	const facets = Object.fromEntries(FACET_KEYS.map((k) => [k, /* @__PURE__ */ new Map()]));
	const absorb = (result, only) => {
		for (const fc of result?.facet_counts ?? []) {
			const key = FACET_KEYS.find((k) => FACET_FIELD[k] === fc.field_name);
			if (!key) continue;
			if (only && key !== only) continue;
			const target = facets[key];
			if (only) target.clear();
			for (const c of fc.counts) target.set(c.value, c.count);
		}
	};
	absorb(primary);
	facetOrder.forEach((key, i) => absorb(body.results[i + 1], key));
	return {
		documents: primary.hits.map((h) => h.document),
		found: primary.found,
		facets
	};
}
//#endregion
//#region src/lib/search/index.ts
var ORDERED = {
	size: SIZE_ORDER,
	fit: [
		"Slim",
		"Regular",
		"Relaxed",
		"Oversized"
	],
	sleeve: [
		"Sleeveless",
		"Short",
		"Long"
	],
	gender: [
		"Men",
		"Women",
		"Unisex"
	]
};
/** In-memory path: the reference implementation. */
function memoryQuery(query) {
	const scoped = query.category ? query.all.filter((p) => p.category === query.category) : query.all;
	const facets = Object.fromEntries(FACET_KEYS.map((key) => [key, facetOptions(scoped, query.filters, key, ORDERED[key])]));
	return {
		products: applyFilters(scoped, query.filters),
		facets,
		backend: "memory"
	};
}
/** Index path. Falls back to memory on any failure rather than erroring. */
async function typesenseQuery(query) {
	const scope = query.category ? `category:=[\`${query.category}\`]` : void 0;
	const response = await search({
		filters: query.filters,
		scope
	});
	/**
	* The index returns which handles match. Cards are hydrated from the already
	* loaded product set, so rendering is unchanged.
	*
	* At real catalogue size you would render cards straight from the index
	* document and stop loading every product — the document carries everything
	* a card needs. Hydration is only free here because the set is small.
	*/
	const byHandle = new Map(query.all.map((p) => [p.handle, p]));
	return {
		products: response.documents.map((d) => byHandle.get(d.handle)).filter((p) => p !== void 0),
		facets: Object.fromEntries(FACET_KEYS.map((key) => {
			const counts = response.facets[key];
			const selected = query.filters[key];
			const ordered = ORDERED[key];
			const values = /* @__PURE__ */ new Set([...counts.keys(), ...selected]);
			return [key, (ordered ? ordered.filter((v) => values.has(v)) : [...values].sort((a, b) => a.localeCompare(b))).filter((value) => value !== "—").map((value) => ({
				value,
				count: counts.get(value) ?? 0,
				selected: selected.includes(value)
			}))];
		})),
		backend: "typesense"
	};
}
async function queryCatalogue(query) {
	if (!isSearchConfigured()) return memoryQuery(query);
	try {
		return await typesenseQuery(query);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[search] Typesense query failed, using in-memory filtering:\n  ${message}`);
		return {
			...memoryQuery(query),
			warning: `Search index unavailable: ${message}`
		};
	}
}
//#endregion
//#region src/pages/collections/[handle].astro
var _handle__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Handle,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://vestry.example");
var $$Handle = createComponent(async ($$result, $$props, $$slots) => {
	const Astro2 = $$result.createAstro($$props, $$slots);
	Astro2.self = $$Handle;
	const COLLECTIONS = {
		"all": {
			title: "Everything",
			blurb: "The full range, twelve styles."
		},
		"t-shirts": {
			title: "T-shirts",
			category: "T-shirts",
			blurb: "Jersey weights from 160 to 220gsm."
		},
		"shirts": {
			title: "Shirts",
			category: "Shirts",
			blurb: "Woven cotton and linen, collared and camp."
		},
		"knitwear": {
			title: "Knitwear",
			category: "Knitwear",
			blurb: "Merino, lambswool and undyed British wool."
		},
		"trousers": {
			title: "Trousers",
			category: "Trousers",
			blurb: "Twill and chino, pleated and tapered."
		}
	};
	const { handle } = Astro2.params;
	const collection = handle ? COLLECTIONS[handle] : void 0;
	if (!collection) {
		Astro2.response.status = 404;
		return Astro2.rewrite("/404");
	}
	const basePath = `/collections/${handle}`;
	const { products, source, reviewProvider, warning } = await loadProducts();
	const filters = filtersFromParams(Astro2.url.searchParams);
	const { products: results, facets, backend, warning: searchWarning } = await queryCatalogue({
		all: products,
		filters,
		category: collection.category
	});
	const active = countActive(filters);
	const siteOrigin = (Astro2.site ?? new URL("https://vestry.example")).origin;
	const collectionUrl = `${siteOrigin}${basePath}`;
	const isFiltered = active > 0;
	const jsonLdCollection = collectionSchema(collection.title, collection.blurb, collectionUrl, results, siteOrigin);
	const jsonLdCrumbs = breadcrumbSchema([{
		name: "Home",
		url: `${siteOrigin}/`
	}, {
		name: collection.title,
		url: collectionUrl
	}]);
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": `${collection.title} — Vestry`,
		"description": collection.blurb,
		"canonical": collectionUrl,
		"noindex": isFiltered,
		"data-astro-cid-mqtnew5t": true
	}, {
		"default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<div class="shell" data-astro-cid-mqtnew5t><header class="col-head" data-astro-cid-mqtnew5t><nav aria-label="Breadcrumb" class="crumbs" data-astro-cid-mqtnew5t><a href="/" data-astro-cid-mqtnew5t>Home</a> <span aria-hidden="true" data-astro-cid-mqtnew5t>/</span> <span data-astro-cid-mqtnew5t>${collection.title}</span></nav><h1 data-astro-cid-mqtnew5t>${collection.title}</h1><p class="blurb" data-astro-cid-mqtnew5t>${collection.blurb}</p>${false}</header><div class="col-layout" data-astro-cid-mqtnew5t><!-- On mobile the panel collapses into a native <details>, which needs
          no JS and stays keyboard operable. --><details class="filter-shell" data-astro-cid-mqtnew5t><summary class="filter-toggle" data-astro-cid-mqtnew5t>Filter &amp; sort${active > 0 && renderTemplate`<span class="badge" data-astro-cid-mqtnew5t>${active}</span>`}</summary>${renderComponent($$result2, "FilterPanel", $$FilterPanel, {
			"facets": facets,
			"filters": filters,
			"basePath": basePath,
			"resultCount": results.length,
			"data-astro-cid-mqtnew5t": true
		})}</details><div class="results" data-astro-cid-mqtnew5t>${results.length === 0 ? renderTemplate`<div class="empty" data-astro-cid-mqtnew5t><h2 data-astro-cid-mqtnew5t>Nothing matches those filters</h2><p data-astro-cid-mqtnew5t>That combination has no styles in stock. Try removing a size or colour — those narrow the results fastest.</p><a${addAttribute(basePath, "href")} class="empty-clear" data-astro-cid-mqtnew5t>Clear all filters</a></div>` : renderTemplate`<ul class="grid" data-astro-cid-mqtnew5t>${results.map((product, i) => renderTemplate`<li data-astro-cid-mqtnew5t>${renderComponent($$result2, "ProductCard", $$ProductCard, {
			"product": product,
			"loading": i < 4 ? "eager" : "lazy",
			"data-astro-cid-mqtnew5t": true
		})}</li>`)}</ul>`}</div></div></div>`,
		"head": ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "JsonLd", $$JsonLd, {
			"data": jsonLdCollection,
			"data-astro-cid-mqtnew5t": true
		})}${renderComponent($$result3, "JsonLd", $$JsonLd, {
			"data": jsonLdCrumbs,
			"data-astro-cid-mqtnew5t": true
		})}` })}`
	})}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/collections/[handle].astro", void 0);
var $$file = "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/collections/[handle].astro";
var $$url = "/collections/[handle]";
//#endregion
//#region \0virtual:astro:page:src/pages/collections/[handle]@_@astro
var page = () => _handle__exports;
//#endregion
export { page };
