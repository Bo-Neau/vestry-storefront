import type { APIRoute } from "astro";
import { addToCart } from "../../lib/cart/index.ts";
import { SIZE_ORDER } from "../../data/schema.ts";
import type { Size } from "../../data/schema.ts";

/**
 * POST /cart/add
 *
 * Post/Redirect/Get: mutate, then 303 back to where the shopper was. That
 * stops a refresh re-adding the item, keeps the back button sane, and needs
 * no JavaScript.
 */
export const POST: APIRoute = async ({ request, cookies, url, redirect }) => {
  const form = await request.formData();

  const handle = String(form.get("handle") ?? "");
  const colorwayId = String(form.get("colorway") ?? "");
  const sizeRaw = String(form.get("size") ?? "");
  const quantity = Number.parseInt(String(form.get("quantity") ?? "1"), 10) || 1;
  const returnTo = String(form.get("returnTo") ?? `/products/${handle}`);

  const size = SIZE_ORDER.find((s) => s === sizeRaw) as Size | undefined;

  // Only ever redirect to our own paths — an open redirect here would let a
  // crafted form bounce shoppers to another site from a trusted domain.
  const safeReturn = returnTo.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/";

  if (!handle || !colorwayId || !size) {
    return redirect(`${safeReturn}${safeReturn.includes("?") ? "&" : "?"}error=size`, 303);
  }

  const { error } = await addToCart(cookies, url, { handle, colorwayId, size, quantity });

  const separator = safeReturn.includes("?") ? "&" : "?";
  return redirect(
    error
      ? `${safeReturn}${separator}error=${encodeURIComponent(error)}`
      : `${safeReturn}${separator}added=${encodeURIComponent(size)}`,
    303,
  );
};
