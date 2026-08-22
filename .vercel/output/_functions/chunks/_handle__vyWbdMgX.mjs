import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { D as maybeRenderHead, E as renderTemplate, F as createAstro, b as renderComponent, k as addAttribute, x as Fragment } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { t as $$Base } from "./Base_DvmQD7lT.mjs";
import { a as averageRating, c as ratingDistribution, i as SIZE_ORDER, n as loadProducts, o as fitVerdict, r as loadSizeChart, t as loadProduct } from "./source_DNojBtZB.mjs";
import { n as formatMoney, t as discountPercent } from "./money_DAFvxNYY.mjs";
import { c as $$ProductImage, i as productSchema, o as $$JsonLd, s as $$ProductCard, t as breadcrumbSchema } from "./structured-data_BG3V5y0q.mjs";
//#region src/components/Gallery.astro
createAstro("https://vestry.example");
var $$Gallery = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Gallery;
	const { shape, colorway, title } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="gallery" data-astro-cid-rj65ajc3><ul class="gal-track" data-astro-cid-rj65ajc3>${[
		{
			view: "front",
			label: "front view"
		},
		{
			view: "back",
			label: "back view"
		},
		{
			view: "flat",
			label: "laid flat"
		},
		{
			view: "detail",
			label: "fabric detail"
		}
	].map(({ view, label }, i) => renderTemplate`<li class="gal-item" data-astro-cid-rj65ajc3>${renderComponent($$result, "ProductImage", $$ProductImage, {
		"colorway": colorway,
		"shape": shape,
		"view": view,
		"alt": `${title} in ${colorway.name}, ${label}`,
		"priority": i === 0,
		"sizes": "(max-width: 860px) 86vw, (max-width: 1320px) 42vw, 550px",
		"data-astro-cid-rj65ajc3": true
	})}</li>`)}</ul><p class="gal-hint" aria-hidden="true" data-astro-cid-rj65ajc3>Swipe for more views</p></div>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/Gallery.astro", void 0);
//#endregion
//#region src/components/SizeGuide.astro
createAstro("https://vestry.example");
var $$SizeGuide = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SizeGuide;
	const { chart, id } = Astro.props;
	const cm = (n) => `${n}`;
	const inches = (n) => (n / 2.54).toFixed(1);
	return renderTemplate`${maybeRenderHead($$result)}<button type="button" class="sg-open"${addAttribute(id, "popovertarget")} data-astro-cid-vgog5tkj>Size guide</button><div${addAttribute(id, "id")} popover="auto" class="sg-pop"${addAttribute(`${id}-title`, "aria-labelledby")} data-astro-cid-vgog5tkj><div class="sg-head" data-astro-cid-vgog5tkj><div data-astro-cid-vgog5tkj><h2${addAttribute(`${id}-title`, "id")} data-astro-cid-vgog5tkj>${chart.name}</h2><p class="sg-sub" data-astro-cid-vgog5tkj>Garment measured laid flat, not body measurements. Compare against a piece you already own that fits the way you want.</p></div><button type="button" class="sg-close"${addAttribute(id, "popovertarget")} popovertargetaction="hide" aria-label="Close size guide" data-astro-cid-vgog5tkj>&times;</button></div><div class="sg-scroll" data-astro-cid-vgog5tkj><table class="sg-table" data-astro-cid-vgog5tkj><caption class="sr-only" data-astro-cid-vgog5tkj>${chart.name}, in centimetres and inches</caption><thead data-astro-cid-vgog5tkj><tr data-astro-cid-vgog5tkj><th scope="col" data-astro-cid-vgog5tkj>Size</th>${chart.rows[0] && chart.rows[0].chestCm > 0 && renderTemplate`<th scope="col" data-astro-cid-vgog5tkj>Chest</th>`}<th scope="col" data-astro-cid-vgog5tkj>Waist</th><th scope="col" data-astro-cid-vgog5tkj>Length</th></tr></thead><tbody data-astro-cid-vgog5tkj>${chart.rows.map((r) => renderTemplate`<tr data-astro-cid-vgog5tkj><th scope="row" data-astro-cid-vgog5tkj>${r.size}</th>${r.chestCm > 0 && renderTemplate`<td data-astro-cid-vgog5tkj>${cm(r.chestCm)}<span class="alt" data-astro-cid-vgog5tkj> / ${inches(r.chestCm)}"</span></td>`}<td data-astro-cid-vgog5tkj>${cm(r.waistCm)}<span class="alt" data-astro-cid-vgog5tkj> / ${inches(r.waistCm)}"</span></td><td data-astro-cid-vgog5tkj>${cm(r.lengthCm)}<span class="alt" data-astro-cid-vgog5tkj> / ${inches(r.lengthCm)}"</span></td></tr>`)}</tbody></table><p class="sg-units" data-astro-cid-vgog5tkj>Centimetres / inches</p></div><div class="sg-how" data-astro-cid-vgog5tkj><h3 data-astro-cid-vgog5tkj>How to measure</h3><dl data-astro-cid-vgog5tkj>${chart.howToMeasure.map((m) => renderTemplate`<div class="sg-row" data-astro-cid-vgog5tkj><dt data-astro-cid-vgog5tkj>${m.part}</dt><dd data-astro-cid-vgog5tkj>${m.instruction}</dd></div>`)}</dl></div></div>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/SizeGuide.astro", void 0);
//#endregion
//#region src/components/Reviews.astro
createAstro("https://vestry.example");
var $$Reviews = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Reviews;
	const { product } = Astro.props;
	const avg = averageRating(product);
	const dist = ratingDistribution(product);
	const total = product.reviews.length;
	const { verdict, share } = fitVerdict(product);
	const VERDICT_COPY = {
		small: "Most reviewers say this runs small — consider sizing up.",
		true: "Most reviewers say this fits true to size.",
		large: "Most reviewers say this runs large — consider sizing down."
	};
	const FIT_LABEL = {
		small: "Ran small",
		true: "True to size",
		large: "Ran large"
	};
	const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
	const pct = (n) => total === 0 ? 0 : Math.round(n / total * 100);
	return renderTemplate`${maybeRenderHead($$result)}<section class="reviews" id="reviews" aria-labelledby="reviews-title" data-astro-cid-4bjs7uhz><h2 id="reviews-title" data-astro-cid-4bjs7uhz>Reviews</h2>${total === 0 ? renderTemplate`<p class="none" data-astro-cid-4bjs7uhz>No reviews yet.</p>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<div class="summary" data-astro-cid-4bjs7uhz><div class="score" data-astro-cid-4bjs7uhz><p class="avg" data-astro-cid-4bjs7uhz>${avg.toFixed(1)}</p><p class="stars" aria-hidden="true" data-astro-cid-4bjs7uhz>${stars(Math.round(avg))}</p><p class="of" data-astro-cid-4bjs7uhz><span class="sr-only" data-astro-cid-4bjs7uhz>${avg.toFixed(1)} out of 5, from </span>${total} review${total === 1 ? "" : "s"}</p></div><ul class="dist" data-astro-cid-4bjs7uhz>${[
		5,
		4,
		3,
		2,
		1
	].map((n) => renderTemplate`<li data-astro-cid-4bjs7uhz><span class="d-n" data-astro-cid-4bjs7uhz>${n}★</span><span class="bar" data-astro-cid-4bjs7uhz><span class="fill"${addAttribute(`width: ${pct(dist[n])}%`, "style")} data-astro-cid-4bjs7uhz></span></span><span class="d-c" data-astro-cid-4bjs7uhz>${dist[n]}</span></li>`)}</ul><div class="fit-agg" data-astro-cid-4bjs7uhz><p class="label" data-astro-cid-4bjs7uhz>Fit</p><p class="fit-verdict" data-astro-cid-4bjs7uhz>${VERDICT_COPY[verdict]}</p><p class="fit-share" data-astro-cid-4bjs7uhz>${Math.round(share * 100)}% of reviewers agree</p></div></div><ul class="list" data-astro-cid-4bjs7uhz>${product.reviews.map((r) => renderTemplate`<li class="review" data-astro-cid-4bjs7uhz><div class="r-head" data-astro-cid-4bjs7uhz><p class="r-stars"${addAttribute(`${r.rating} out of 5`, "aria-label")} data-astro-cid-4bjs7uhz><span aria-hidden="true" data-astro-cid-4bjs7uhz>${stars(r.rating)}</span></p><h3 class="r-title" data-astro-cid-4bjs7uhz>${r.title}</h3></div><p class="r-body" data-astro-cid-4bjs7uhz>${r.body}</p><dl class="r-fit" data-astro-cid-4bjs7uhz><div data-astro-cid-4bjs7uhz><dt data-astro-cid-4bjs7uhz>Height</dt><dd data-astro-cid-4bjs7uhz>${r.heightBand}</dd></div><div data-astro-cid-4bjs7uhz><dt data-astro-cid-4bjs7uhz>Size bought</dt><dd data-astro-cid-4bjs7uhz>${r.sizePurchased}</dd></div><div data-astro-cid-4bjs7uhz><dt data-astro-cid-4bjs7uhz>Fit</dt><dd${addAttribute(`fit-${r.fitFeedback}`, "class")} data-astro-cid-4bjs7uhz>${FIT_LABEL[r.fitFeedback]}</dd></div></dl><p class="r-meta" data-astro-cid-4bjs7uhz>${r.author}${r.verified && renderTemplate`<span class="ver" data-astro-cid-4bjs7uhz> · Verified buyer</span>`}<span class="date" data-astro-cid-4bjs7uhz> · ${new Date(r.date).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric"
	})}</span></p></li>`)}</ul>` })}`}</section>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/Reviews.astro", void 0);
function stockStateFor(colorway, size) {
	const row = colorway.sizes.find((s) => s.size === size);
	const n = row ? row.inventory : 0;
	if (n <= 0) return "out";
	if (n <= 3) return "low";
	return "in";
}
function stockLabel(state) {
	if (state === "out") return "Sold out";
	if (state === "low") return "Low stock";
	return "In stock";
}
//#endregion
//#region src/pages/products/[handle].astro
var _handle__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Handle,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://vestry.example");
var $$Handle = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Handle;
	const { handle } = Astro.params;
	const { product } = handle ? await loadProduct(handle) : { product: void 0 };
	if (!product) {
		Astro.response.status = 404;
		return Astro.rewrite("/404");
	}
	const addedSize = Astro.url.searchParams.get("added");
	const addError = Astro.url.searchParams.get("error");
	const requested = Astro.url.searchParams.get("color");
	const colorway = product.colorways.find((c) => c.id === requested) ?? product.colorways[0];
	const chart = await loadSizeChart(product.sizeChartId);
	const avg = averageRating(product);
	const { verdict } = fitVerdict(product);
	const off = product.compareAtPrice ? discountPercent(product.price, product.compareAtPrice) : 0;
	const heightFt = Math.floor(product.fit.modelHeightCm / 2.54 / 12);
	const heightIn = Math.round(product.fit.modelHeightCm / 2.54 % 12);
	const RUNS_NOTE = {
		small: "Runs small — consider sizing up.",
		true: "Fits true to size.",
		large: "Runs large — consider sizing down."
	};
	const canonical = new URL(`/products/${product.handle}`, Astro.url).href;
	const siteOrigin = (Astro.site ?? new URL("https://vestry.example")).origin;
	const jsonLdProduct = productSchema(product, canonical, "Vestry");
	const jsonLdCrumbs = breadcrumbSchema([
		{
			name: "Home",
			url: `${siteOrigin}/`
		},
		{
			name: product.category,
			url: `${siteOrigin}/collections/${product.category.toLowerCase()}`
		},
		{
			name: product.title,
			url: canonical
		}
	]);
	const { products: allProducts } = await loadProducts();
	const alsoLike = allProducts.filter((p) => p.id !== product.id && p.category !== product.category).slice(0, 4);
	const sizeRows = SIZE_ORDER.map((size) => {
		const state = stockStateFor(colorway, size);
		const row = colorway.sizes.find((s) => s.size === size);
		return {
			size,
			state,
			inventory: row ? row.inventory : 0
		};
	});
	const anyInStock = sizeRows.some((r) => r.state !== "out");
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": `${product.title} — ${colorway.name} — Vestry`,
		"description": product.summary,
		"canonical": canonical,
		"ogType": "product",
		"data-astro-cid-ovbc35m2": true
	}, {
		"default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="shell" data-astro-cid-ovbc35m2><nav aria-label="Breadcrumb" class="crumbs" data-astro-cid-ovbc35m2><a href="/" data-astro-cid-ovbc35m2>Home</a> <span aria-hidden="true" data-astro-cid-ovbc35m2>/</span><a${addAttribute(`/collections/${product.category.toLowerCase()}`, "href")} data-astro-cid-ovbc35m2>${product.category}</a><span aria-hidden="true" data-astro-cid-ovbc35m2>/</span> <span data-astro-cid-ovbc35m2>${product.title}</span></nav>${addedSize && renderTemplate`<p class="added" role="status" data-astro-cid-ovbc35m2>Added to bag — ${product.title}, ${colorway.name}, size ${addedSize}.<a href="/cart" class="added-link" data-astro-cid-ovbc35m2>View bag</a></p>`}${addError && renderTemplate`<p class="add-error" role="alert" data-astro-cid-ovbc35m2>${addError === "size" ? "Choose a size before adding to your bag." : addError}</p>`}<div class="pdp" data-astro-cid-ovbc35m2><!-- ZONE 1 — gallery --><div class="pdp-media" data-astro-cid-ovbc35m2>${renderComponent($$result, "Gallery", $$Gallery, {
			"shape": product.shape,
			"colorway": colorway,
			"title": product.title,
			"data-astro-cid-ovbc35m2": true
		})}</div><div class="pdp-info" data-astro-cid-ovbc35m2><!-- ZONE 2 — name, price, rating linked to reviews --><header class="p-head" data-astro-cid-ovbc35m2><h1 data-astro-cid-ovbc35m2>${product.title}</h1><p class="p-price money" data-astro-cid-ovbc35m2><span${addAttribute(off > 0 ? "now" : "", "class")} data-astro-cid-ovbc35m2>${formatMoney(product.price)}</span>${product.compareAtPrice && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<s class="was" data-astro-cid-ovbc35m2>${formatMoney(product.compareAtPrice)}</s><span class="off" data-astro-cid-ovbc35m2>${off}% off</span>` })}`}</p>${product.reviews.length > 0 && renderTemplate`<p class="p-rating" data-astro-cid-ovbc35m2><a href="#reviews" data-astro-cid-ovbc35m2><span aria-hidden="true" data-astro-cid-ovbc35m2>${"★".repeat(Math.round(avg))}${"☆".repeat(5 - Math.round(avg))}</span>${" "}${avg.toFixed(1)}<span class="r-count" data-astro-cid-ovbc35m2> (${product.reviews.length} reviews)</span></a></p>`}<p class="p-summary" data-astro-cid-ovbc35m2>${product.summary}</p></header><!-- ZONE 3 — model reference. The single highest-value line here. --><p class="fit-ref" data-astro-cid-ovbc35m2>Model is ${heightFt}′${heightIn}″ (${product.fit.modelHeightCm}cm), wearing size ${product.fit.modelSizeWorn}</p><p${addAttribute(`runs runs-${product.fit.runsTrueToSize}`, "class")} data-astro-cid-ovbc35m2>${RUNS_NOTE[product.fit.runsTrueToSize]}</p><form method="POST" action="/cart/add" class="buy" id="buy-form" data-astro-cid-ovbc35m2><input type="hidden" name="handle"${addAttribute(product.handle, "value")} data-astro-cid-ovbc35m2><input type="hidden" name="colorway"${addAttribute(colorway.id, "value")} data-astro-cid-ovbc35m2><input type="hidden" name="quantity" value="1" data-astro-cid-ovbc35m2><input type="hidden" name="returnTo"${addAttribute(`/products/${product.handle}?color=${colorway.id}`, "value")} data-astro-cid-ovbc35m2><!-- ZONE 4 — colourway: swatch AND name, never one alone --><fieldset class="colors" data-astro-cid-ovbc35m2><legend data-astro-cid-ovbc35m2><span class="label" data-astro-cid-ovbc35m2>Colour</span><span class="c-name" data-astro-cid-ovbc35m2>${colorway.name}</span></legend><ul data-astro-cid-ovbc35m2>${product.colorways.map((c) => renderTemplate`<li data-astro-cid-ovbc35m2><a${addAttribute(`/products/${product.handle}?color=${c.id}`, "href")}${addAttribute(["sw", { on: c.id === colorway.id }], "class:list")}${addAttribute(`--a: ${c.hex}; --b: ${c.hexAlt ?? c.hex};`, "style")}${addAttribute(c.id === colorway.id ? "true" : void 0, "aria-current")} data-astro-cid-ovbc35m2><span class="sr-only" data-astro-cid-ovbc35m2>${c.name}</span></a></li>`)}</ul></fieldset><!-- ZONE 5 — sizes as BUTTONS, sold out struck through not hidden --><fieldset class="sizes" data-astro-cid-ovbc35m2><legend class="sz-legend" data-astro-cid-ovbc35m2><span class="label" data-astro-cid-ovbc35m2>Size</span>${chart && renderTemplate`${renderComponent($$result, "SizeGuide", $$SizeGuide, {
			"chart": chart,
			"id": `sg-${product.handle}`,
			"data-astro-cid-ovbc35m2": true
		})}`}</legend><ul class="sz-list" data-astro-cid-ovbc35m2>${sizeRows.map(({ size, state, inventory }) => renderTemplate`<li data-astro-cid-ovbc35m2><input type="radio" name="size"${addAttribute(`sz-${size}`, "id")}${addAttribute(size, "value")}${addAttribute(state === "out", "disabled")} required class="sz-input sr-only" data-astro-cid-ovbc35m2><label${addAttribute(`sz-${size}`, "for")}${addAttribute(["sz-btn", { out: state === "out" }], "class:list")} data-astro-cid-ovbc35m2>${size}<span class="sr-only" data-astro-cid-ovbc35m2>${" — "}${stockLabel(state)}${state === "low" ? `, only ${inventory} left` : ""}</span></label></li>`)}</ul>${sizeRows.some((r) => r.state === "low") && renderTemplate`<p class="low-note" data-astro-cid-ovbc35m2>Low stock in ${sizeRows.filter((r) => r.state === "low").map((r) => r.size).join(", ")}${" "}(${3} or fewer left in ${colorway.name})</p>`}${!anyInStock && renderTemplate`<p class="low-note out-all" data-astro-cid-ovbc35m2>${colorway.name} is sold out in every size.</p>`}</fieldset><!-- ZONE 6 — add to bag, sticky on mobile --><div class="atc-wrap" data-astro-cid-ovbc35m2><button type="submit" class="atc"${addAttribute(!anyInStock, "disabled")} data-astro-cid-ovbc35m2>${anyInStock ? "Add to bag" : "Sold out"}</button></div><!-- ZONE 7 — returns and shipping, inline with real numbers --><ul class="policy" data-astro-cid-ovbc35m2><li data-astro-cid-ovbc35m2>Free shipping over $75, otherwise $6 flat</li><li data-astro-cid-ovbc35m2>Free returns for 30 days, unworn with tags</li><li data-astro-cid-ovbc35m2>Exchanges are one step — swap size without repurchasing</li></ul></form><!-- ZONE 8 — specs, progressively disclosed --><div class="specs" data-astro-cid-ovbc35m2><details data-astro-cid-ovbc35m2><summary data-astro-cid-ovbc35m2>Fit</summary><div class="spec-body" data-astro-cid-ovbc35m2><dl data-astro-cid-ovbc35m2><div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Cut</dt><dd data-astro-cid-ovbc35m2>${product.attributes.fit}</dd></div>${product.attributes.neckline && renderTemplate`<div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Neckline</dt><dd data-astro-cid-ovbc35m2>${product.attributes.neckline}</dd></div>`}${product.attributes.sleeveLength && renderTemplate`<div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Sleeve</dt><dd data-astro-cid-ovbc35m2>${product.attributes.sleeveLength}</dd></div>`}<div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Cut for</dt><dd data-astro-cid-ovbc35m2>${product.attributes.targetGender}</dd></div><div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Reviewers say</dt><dd data-astro-cid-ovbc35m2>${verdict === "true" ? "True to size" : verdict === "small" ? "Runs small" : "Runs large"}</dd></div></dl></div></details><details data-astro-cid-ovbc35m2><summary data-astro-cid-ovbc35m2>Materials &amp; care</summary><div class="spec-body" data-astro-cid-ovbc35m2><dl data-astro-cid-ovbc35m2><div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Fabric</dt><dd data-astro-cid-ovbc35m2>${product.attributes.fabric}</dd></div><div data-astro-cid-ovbc35m2><dt data-astro-cid-ovbc35m2>Weight</dt><dd data-astro-cid-ovbc35m2>${product.attributes.fabricWeightGsm} gsm</dd></div></dl><ul class="bullets" data-astro-cid-ovbc35m2>${product.care.map((c) => renderTemplate`<li data-astro-cid-ovbc35m2>${c}</li>`)}</ul></div></details><details data-astro-cid-ovbc35m2><summary data-astro-cid-ovbc35m2>Details</summary><div class="spec-body" data-astro-cid-ovbc35m2><ul class="bullets" data-astro-cid-ovbc35m2>${product.attributes.features.map((f) => renderTemplate`<li data-astro-cid-ovbc35m2>${f}</li>`)}${product.details.map((d) => renderTemplate`<li data-astro-cid-ovbc35m2>${d}</li>`)}</ul></div></details><details data-astro-cid-ovbc35m2><summary data-astro-cid-ovbc35m2>Description</summary><div class="spec-body" data-astro-cid-ovbc35m2><p class="desc" data-astro-cid-ovbc35m2>${product.description}</p></div></details></div></div></div><!--
      ZONE 6b — mobile add-to-bag bar.

      A sticky button inside the form only sticks while the form is on
      screen, so it disappears once the shopper reaches specs and reviews —
      exactly where they decide. A fixed bar with form="buy-form" submits the
      same form from outside it (valid HTML5), so the button is reachable at
      every scroll position without a line of JavaScript.
    --><div class="atc-bar" aria-hidden="false" data-astro-cid-ovbc35m2><span class="atc-bar-price money" data-astro-cid-ovbc35m2>${formatMoney(product.price)}</span><button type="submit" form="buy-form" class="atc atc-bar-btn"${addAttribute(!anyInStock, "disabled")} data-astro-cid-ovbc35m2>${anyInStock ? "Add to bag" : "Sold out"}</button></div><!-- ZONE 9 — reviews with structured fit data -->${renderComponent($$result, "Reviews", $$Reviews, {
			"product": product,
			"data-astro-cid-ovbc35m2": true
		})}<!-- ZONE 10 — outfit cross-sell, not a generic "related" grid --><section class="look" aria-labelledby="look-title" data-astro-cid-ovbc35m2><h2 id="look-title" data-astro-cid-ovbc35m2>Complete the look</h2><ul class="grid" data-astro-cid-ovbc35m2>${alsoLike.map((p) => renderTemplate`<li data-astro-cid-ovbc35m2>${renderComponent($$result, "ProductCard", $$ProductCard, {
			"product": p,
			"data-astro-cid-ovbc35m2": true
		})}</li>`)}</ul></section></div>`,
		"head": ($$result) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "slot": "head" }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "JsonLd", $$JsonLd, {
			"data": jsonLdProduct,
			"data-astro-cid-ovbc35m2": true
		})}${renderComponent($$result, "JsonLd", $$JsonLd, {
			"data": jsonLdCrumbs,
			"data-astro-cid-ovbc35m2": true
		})}` })}`
	})}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/products/[handle].astro", void 0);
var $$file = "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/products/[handle].astro";
var $$url = "/products/[handle]";
//#endregion
//#region \0virtual:astro:page:src/pages/products/[handle]@_@astro
var page = () => _handle__exports;
//#endregion
export { page };
