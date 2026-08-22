import type { APIRoute } from "astro";
import { updateLine, removeFromCart } from "../../lib/cart/index.ts";

/**
 * POST /cart/update — quantity change or removal.
 *
 * One route for both so the cart page needs a single form pattern. A submit
 * button named `remove` wins over any quantity value.
 */
export const POST: APIRoute = async ({ request, cookies, url, redirect }) => {
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
