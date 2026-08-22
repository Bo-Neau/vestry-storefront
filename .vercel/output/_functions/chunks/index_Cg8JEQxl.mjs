import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { D as maybeRenderHead, E as renderTemplate, F as createAstro, b as renderComponent, k as addAttribute } from "./sequence_Di15ZzfY.mjs";
import { t as createComponent } from "./compiler_DBdX9DHX.mjs";
import { t as $$Base } from "./Base_DvmQD7lT.mjs";
import { n as readCart } from "./cart_HwwD9Mm5.mjs";
import { n as formatMoney, r as $$Garment } from "./money_DAFvxNYY.mjs";
//#region src/pages/cart/index.astro
var cart_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://vestry.example");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const cart = await readCart(Astro.cookies);
	const removed = Astro.url.searchParams.has("removed");
	const remaining = Math.max(0, 7500 - cart.subtotal.amount);
	const shipping = remaining > 0 ? 600 : 0;
	const total = cart.subtotal.amount + shipping;
	const overstocked = cart.lines.filter((l) => l.quantity > l.available);
	return renderTemplate`${renderComponent($$result, "Base", $$Base, {
		"title": "Your bag — Vestry",
		"description": "Review your bag before checkout.",
		"noindex": true,
		"data-astro-cid-jn2z7gbh": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="shell cart-wrap" data-astro-cid-jn2z7gbh><h1 data-astro-cid-jn2z7gbh>Your bag</h1>${removed && renderTemplate`<p class="flash" role="status" data-astro-cid-jn2z7gbh>Item removed.</p>`}${cart.warning && renderTemplate`<p class="flash warn" role="status" data-astro-cid-jn2z7gbh>${cart.warning}</p>`}${cart.lines.length === 0 ? renderTemplate`<div class="empty" data-astro-cid-jn2z7gbh><p data-astro-cid-jn2z7gbh>Your bag is empty.</p><a href="/collections/all" class="btn" data-astro-cid-jn2z7gbh>Continue shopping</a></div>` : renderTemplate`<div class="cart-grid" data-astro-cid-jn2z7gbh><section aria-label="Items in your bag" data-astro-cid-jn2z7gbh><ul class="lines" data-astro-cid-jn2z7gbh>${cart.lines.map((line) => renderTemplate`<li class="line" data-astro-cid-jn2z7gbh><a${addAttribute(`/products/${line.handle}?color=${line.colorwayId}`, "href")} class="thumb" aria-hidden="true" tabindex="-1" data-astro-cid-jn2z7gbh>${line.imageSrc ? renderTemplate`<img${addAttribute(line.imageSrc, "src")} alt="" width="120" height="156" loading="lazy" data-astro-cid-jn2z7gbh>` : renderTemplate`${renderComponent($$result, "Garment", $$Garment, {
		"shape": line.shape,
		"hex": line.hex,
		"hexAlt": line.hexAlt,
		"view": "front",
		"alt": "",
		"data-astro-cid-jn2z7gbh": true
	})}`}</a><div class="line-body" data-astro-cid-jn2z7gbh><h2 class="line-title" data-astro-cid-jn2z7gbh><a${addAttribute(`/products/${line.handle}?color=${line.colorwayId}`, "href")} data-astro-cid-jn2z7gbh>${line.title}</a></h2><p class="line-meta" data-astro-cid-jn2z7gbh>${line.colorName} · Size ${line.size}</p><p class="line-unit money" data-astro-cid-jn2z7gbh>${formatMoney(line.unitPrice)} each</p>${line.quantity > line.available && renderTemplate`<p class="line-warn" data-astro-cid-jn2z7gbh>Only ${line.available} left — reduce the quantity to continue.</p>`}<form method="POST" action="/cart/update" class="qty-form" data-astro-cid-jn2z7gbh><input type="hidden" name="id"${addAttribute(line.id, "value")} data-astro-cid-jn2z7gbh><label class="sr-only"${addAttribute(`qty-${line.id}`, "for")} data-astro-cid-jn2z7gbh>Quantity for ${line.title}, ${line.colorName}, size ${line.size}</label><input type="number"${addAttribute(`qty-${line.id}`, "id")} name="quantity"${addAttribute(line.quantity, "value")} min="1"${addAttribute(10, "max")} inputmode="numeric" class="qty" data-astro-cid-jn2z7gbh><button type="submit" class="linkish" data-astro-cid-jn2z7gbh>Update</button><button type="submit" name="remove" value="1" class="linkish danger" data-astro-cid-jn2z7gbh>Remove<span class="sr-only" data-astro-cid-jn2z7gbh> ${line.title}, ${line.colorName}, size ${line.size}</span></button></form></div><p class="line-total money" data-astro-cid-jn2z7gbh>${formatMoney(line.linePrice)}</p></li>`)}</ul></section><aside class="summary" aria-label="Order summary" data-astro-cid-jn2z7gbh><h2 data-astro-cid-jn2z7gbh>Summary</h2><dl class="totals" data-astro-cid-jn2z7gbh><div data-astro-cid-jn2z7gbh><dt data-astro-cid-jn2z7gbh>Subtotal</dt><dd class="money" data-astro-cid-jn2z7gbh>${formatMoney(cart.subtotal)}</dd></div><div data-astro-cid-jn2z7gbh><dt data-astro-cid-jn2z7gbh>Shipping</dt><dd class="money" data-astro-cid-jn2z7gbh>${shipping === 0 ? "Free" : formatMoney({
		amount: shipping,
		currency: "USD"
	})}</dd></div><div class="grand" data-astro-cid-jn2z7gbh><dt data-astro-cid-jn2z7gbh>Total</dt><dd class="money" data-astro-cid-jn2z7gbh>${formatMoney({
		amount: total,
		currency: "USD"
	})}</dd></div></dl><p class="tax-note" data-astro-cid-jn2z7gbh>Taxes calculated at checkout.</p>${remaining > 0 && renderTemplate`<p class="free-ship" data-astro-cid-jn2z7gbh>Spend ${formatMoney({
		amount: remaining,
		currency: "USD"
	})} more for free shipping.</p>`}${overstocked.length > 0 ? renderTemplate`<p class="blocked" role="alert" data-astro-cid-jn2z7gbh>Reduce quantities above before checking out.</p>` : cart.checkoutUrl ? renderTemplate`<a${addAttribute(cart.checkoutUrl, "href")} class="checkout" rel="nofollow" data-astro-cid-jn2z7gbh>Checkout</a>` : renderTemplate`<div class="no-checkout" data-astro-cid-jn2z7gbh><p class="checkout disabled" aria-disabled="true" data-astro-cid-jn2z7gbh>Checkout</p><p class="no-checkout-note" data-astro-cid-jn2z7gbh>Checkout is handled by the commerce platform — payment, tax and fraud stay on their side. Connect a Shopify store and this becomes a live checkout link.</p></div>`}<ul class="reassure" data-astro-cid-jn2z7gbh><li data-astro-cid-jn2z7gbh>Free returns for 30 days</li><li data-astro-cid-jn2z7gbh>Exchanges are one step</li></ul><a href="/collections/all" class="keep" data-astro-cid-jn2z7gbh>Continue shopping</a></aside></div>`}</div>` })}`;
}, "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/cart/index.astro", void 0);
var $$file = "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/src/pages/cart/index.astro";
var $$url = "/cart";
//#endregion
//#region \0virtual:astro:page:src/pages/cart/index@_@astro
var page = () => cart_exports;
//#endregion
export { page };
