import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { i as updateLine, r as removeFromCart } from "./cart_HwwD9Mm5.mjs";
//#region src/pages/cart/update.ts
var update_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
/**
* POST /cart/update — quantity change or removal.
*
* One route for both so the cart page needs a single form pattern. A submit
* button named `remove` wins over any quantity value.
*/
var POST = async ({ request, cookies, url, redirect }) => {
	const form = await request.formData();
	const id = String(form.get("id") ?? "");
	if (!id) return redirect("/cart", 303);
	if (form.get("remove") !== null) {
		await removeFromCart(cookies, url, id);
		return redirect("/cart?removed=1", 303);
	}
	const quantity = Number.parseInt(String(form.get("quantity") ?? "1"), 10);
	await updateLine(cookies, url, id, Number.isFinite(quantity) ? quantity : 1);
	return redirect("/cart", 303);
};
//#endregion
//#region \0virtual:astro:page:src/pages/cart/update@_@ts
var page = () => update_exports;
//#endregion
export { page };
