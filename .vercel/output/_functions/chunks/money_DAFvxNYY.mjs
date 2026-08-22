import { D as maybeRenderHead, E as renderTemplate, F as createAstro, k as addAttribute } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
//#region src/components/Garment.astro
createAstro("https://vestry.example");
var $$Garment = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Garment;
	const { shape, hex, hexAlt, view = "front", alt, loading = "lazy" } = Astro.props;
	const uid = Math.random().toString(36).slice(2, 9);
	const BODY = {
		tee: "M150 100 L96 132 L60 250 L108 268 L104 470 L296 470 L292 268 L340 250 L304 132 L250 100 C240 124 220 133 200 133 C180 133 160 124 150 100 Z",
		shirt: "M150 96 L92 130 L58 258 L106 276 L102 474 L298 474 L294 276 L342 258 L308 130 L250 96 L200 128 Z",
		knit: "M152 104 L92 136 L54 330 L104 344 L102 462 L298 462 L296 344 L346 330 L308 136 L248 104 C238 126 220 134 200 134 C180 134 162 126 152 104 Z",
		trouser: "M112 96 L288 96 L296 150 L272 470 L212 470 L200 250 L188 470 L128 470 L104 150 Z"
	};
	const texture = {
		tee: "woven",
		shirt: "woven",
		knit: "rib",
		trouser: "twill"
	}[shape];
	const isDetail = view === "detail";
	return renderTemplate`${maybeRenderHead($$result)}<svg viewBox="0 0 400 520" role="img"${addAttribute(alt, "aria-label")} class="garment"${addAttribute(view, "data-view")}${addAttribute(loading, "data-loading")} xmlns="http://www.w3.org/2000/svg" data-astro-cid-7ah6snty><defs data-astro-cid-7ah6snty><linearGradient${addAttribute(`g-${uid}`, "id")} x1="0" y1="0" x2="0.35" y2="1" data-astro-cid-7ah6snty><stop offset="0%"${addAttribute(hexAlt ?? hex, "stop-color")} stop-opacity="1" data-astro-cid-7ah6snty></stop><stop offset="55%"${addAttribute(hex, "stop-color")} stop-opacity="1" data-astro-cid-7ah6snty></stop><stop offset="100%"${addAttribute(hex, "stop-color")} stop-opacity="0.86" data-astro-cid-7ah6snty></stop></linearGradient>${texture === "woven" && renderTemplate`<pattern${addAttribute(`t-${uid}`, "id")} width="7" height="7" patternUnits="userSpaceOnUse" data-astro-cid-7ah6snty><path d="M0 0 H7 M0 3.5 H7" stroke="#000" stroke-opacity="0.055" stroke-width="1" data-astro-cid-7ah6snty></path><path d="M0 0 V7 M3.5 0 V7" stroke="#fff" stroke-opacity="0.05" stroke-width="1" data-astro-cid-7ah6snty></path></pattern>`}${texture === "rib" && renderTemplate`<pattern${addAttribute(`t-${uid}`, "id")} width="10" height="10" patternUnits="userSpaceOnUse" data-astro-cid-7ah6snty><path d="M2 0 V10" stroke="#000" stroke-opacity="0.08" stroke-width="2.5" data-astro-cid-7ah6snty></path><path d="M6.5 0 V10" stroke="#fff" stroke-opacity="0.07" stroke-width="2" data-astro-cid-7ah6snty></path></pattern>`}${texture === "twill" && renderTemplate`<pattern${addAttribute(`t-${uid}`, "id")} width="8" height="8" patternUnits="userSpaceOnUse" data-astro-cid-7ah6snty><path d="M-2 6 L6 -2 M2 10 L10 2" stroke="#000" stroke-opacity="0.07" stroke-width="1.6" data-astro-cid-7ah6snty></path></pattern>`}<radialGradient${addAttribute(`bg-${uid}`, "id")} cx="0.5" cy="0.38" r="0.78" data-astro-cid-7ah6snty><stop offset="0%" stop-color="var(--paper-2)" data-astro-cid-7ah6snty></stop><stop offset="100%" stop-color="var(--paper-3)" data-astro-cid-7ah6snty></stop></radialGradient></defs><rect width="400" height="520"${addAttribute(`url(#bg-${uid})`, "fill")} data-astro-cid-7ah6snty></rect>${isDetail ? renderTemplate`<g data-astro-cid-7ah6snty><rect x="40" y="60" width="320" height="400" rx="2"${addAttribute(`url(#g-${uid})`, "fill")} data-astro-cid-7ah6snty></rect><rect x="40" y="60" width="320" height="400" rx="2"${addAttribute(`url(#t-${uid})`, "fill")}${addAttribute(`transform: scale(3.2); transform-origin: 200px 260px;`, "style")} data-astro-cid-7ah6snty></rect><rect x="40" y="60" width="320" height="400" rx="2" fill="none" stroke="#000" stroke-opacity="0.1" stroke-width="1" data-astro-cid-7ah6snty></rect><text x="200" y="492" text-anchor="middle" class="g-cap" data-astro-cid-7ah6snty>Fabric detail</text></g>` : renderTemplate`<g data-astro-cid-7ah6snty><ellipse cx="200" cy="486" rx="128" ry="13" fill="#000" opacity="0.06" data-astro-cid-7ah6snty></ellipse><g${addAttribute(view === "flat" ? "translate(200 268) scale(0.9) translate(-200 -268)" : "", "transform")} data-astro-cid-7ah6snty><path${addAttribute(BODY[shape], "d")}${addAttribute(`url(#g-${uid})`, "fill")} data-astro-cid-7ah6snty></path><path${addAttribute(BODY[shape], "d")}${addAttribute(`url(#t-${uid})`, "fill")} data-astro-cid-7ah6snty></path><path${addAttribute(BODY[shape], "d")} fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="1.4" data-astro-cid-7ah6snty></path>${shape !== "trouser" && view === "back" && renderTemplate`<path d="M152 104 C168 118 182 122 200 122 C218 122 232 118 248 104" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="2.5" data-astro-cid-7ah6snty></path>`}${shape === "shirt" && view !== "back" && renderTemplate`<g data-astro-cid-7ah6snty><path d="M200 128 L166 96 L150 96 L186 142 Z" fill="#000" fill-opacity="0.07" data-astro-cid-7ah6snty></path><path d="M200 128 L234 96 L250 96 L214 142 Z" fill="#000" fill-opacity="0.07" data-astro-cid-7ah6snty></path><path d="M200 132 V474" stroke="#000" stroke-opacity="0.14" stroke-width="2" data-astro-cid-7ah6snty></path>${[
		186,
		244,
		302,
		360,
		418
	].map((cy) => renderTemplate`<circle cx="200"${addAttribute(cy, "cy")} r="4" fill="#fff" fill-opacity="0.55" stroke="#000" stroke-opacity="0.2" stroke-width="1" data-astro-cid-7ah6snty></circle>`)}</g>`}${shape === "knit" && renderTemplate`<g stroke="#000" stroke-opacity="0.15" stroke-width="1.4" fill="none" data-astro-cid-7ah6snty><path d="M104 438 H296" data-astro-cid-7ah6snty></path><path d="M60 316 L104 330" data-astro-cid-7ah6snty></path><path d="M340 316 L296 330" data-astro-cid-7ah6snty></path></g>`}${shape === "trouser" && renderTemplate`<g stroke="#000" stroke-opacity="0.15" stroke-width="1.5" fill="none" data-astro-cid-7ah6snty><path d="M108 140 H292" data-astro-cid-7ah6snty></path><path d="M156 150 L146 460" data-astro-cid-7ah6snty></path><path d="M244 150 L254 460" data-astro-cid-7ah6snty></path></g>`}${view === "flat" && renderTemplate`<g stroke="#000" stroke-opacity="0.09" stroke-width="1.2" fill="none" data-astro-cid-7ah6snty><path d="M104 300 H296" data-astro-cid-7ah6snty></path></g>`}</g><text x="200" y="504" text-anchor="middle" class="g-cap" data-astro-cid-7ah6snty>${view === "front" ? "Front" : view === "back" ? "Back" : "Laid flat"}</text></g>`}</svg>`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/components/Garment.astro", void 0);
var formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 0,
	maximumFractionDigits: 0
});
function formatMoney(money) {
	if (money.currency !== "USD") throw new Error(`Currency mismatch: got ${money.currency}, storefront is USD. Localise the value before rendering, do not mix currencies on one page.`);
	return formatter.format(money.amount / 100);
}
/** Percentage off, rounded down so we never overstate a discount. */
function discountPercent(price, compareAt) {
	if (compareAt.amount <= price.amount) return 0;
	return Math.floor((compareAt.amount - price.amount) / compareAt.amount * 100);
}
//#endregion
export { formatMoney as n, $$Garment as r, discountPercent as t };
