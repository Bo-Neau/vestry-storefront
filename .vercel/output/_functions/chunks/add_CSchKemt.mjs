import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { i as SIZE_ORDER } from "./source_DNojBtZB.mjs";
import { t as addToCart } from "./cart_HwwD9Mm5.mjs";
//#region src/pages/cart/add.ts
var add_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
/**
* POST /cart/add
*
* Post/Redirect/Get: mutate, then 303 back to where the shopper was. That
* stops a refresh re-adding the item, keeps the back button sane, and needs
* no JavaScript.
*/
var POST = async ({ request, cookies, url, redirect }) => {
	const form = await request.formData();
	const handle = String(form.get("handle") ?? "");
	const colorwayId = String(form.get("colorway") ?? "");
	const sizeRaw = String(form.get("size") ?? "");
	const quantity = Number.parseInt(String(form.get("quantity") ?? "1"), 10) || 1;
	const returnTo = String(form.get("returnTo") ?? `/products/${handle}`);
	const size = SIZE_ORDER.find((s) => s === sizeRaw);
	const safeReturn = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
	if (!handle || !colorwayId || !size) return redirect(`${safeReturn}${safeReturn.includes("?") ? "&" : "?"}error=size`, 303);
	const { error } = await addToCart(cookies, url, {
		handle,
		colorwayId,
		size,
		quantity
	});
	const separator = safeReturn.includes("?") ? "&" : "?";
	return redirect(error ? `${safeReturn}${separator}error=${encodeURIComponent(error)}` : `${safeReturn}${separator}added=${encodeURIComponent(size)}`, 303);
};
//#endregion
//#region \0virtual:astro:page:src/pages/cart/add@_@ts
var page = () => add_exports;
//#endregion
export { page };
