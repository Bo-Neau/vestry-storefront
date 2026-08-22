import { d as isShopifyConfigured, i as SIZE_ORDER, n as loadProducts, u as storefront } from "./source_DNojBtZB.mjs";
//#region src/lib/cart/types.ts
var EMPTY_CART = {
	lines: [],
	itemCount: 0,
	subtotal: {
		amount: 0,
		currency: "USD"
	},
	checkoutUrl: null,
	backend: "local"
};
//#endregion
//#region src/lib/cart/cookie.ts
/**
* Cart cookie.
*
* Two shapes, one cookie:
*   - Shopify mode stores just the cart id. Shopify holds the truth.
*   - Sample mode stores compact line references. NEVER prices — those are
*     recomputed from the catalogue on every render.
*
* Format: `v1|<handle>~<colorwayId>~<size>~<qty>|...`
*/
var CART_COOKIE = "vestry_cart";
var CART_ID_COOKIE = "vestry_cart_id";
var COOKIE_MAX_AGE = 1209600;
var cookieOptions = (secure) => ({
	path: "/",
	httpOnly: true,
	sameSite: "lax",
	secure,
	maxAge: COOKIE_MAX_AGE
});
var SAFE = /^[a-zA-Z0-9_-]+$/;
/** Parses defensively: anything malformed is dropped, never thrown. */
function parseCartCookie(raw) {
	if (!raw) return [];
	const parts = raw.split("|");
	if (parts.shift() !== "v1") return [];
	const lines = [];
	for (const part of parts) {
		if (lines.length >= 50) break;
		const [handle, colorwayId, size, qty] = part.split("~");
		if (!handle || !colorwayId || !size || !qty) continue;
		if (!SAFE.test(handle) || !SAFE.test(colorwayId)) continue;
		const matchedSize = SIZE_ORDER.find((s) => s === size);
		if (!matchedSize) continue;
		const quantity = Number.parseInt(qty, 10);
		if (!Number.isFinite(quantity) || quantity < 1) continue;
		lines.push({
			handle,
			colorwayId,
			size: matchedSize,
			quantity: Math.min(quantity, 10)
		});
	}
	return lines;
}
function serialiseCartCookie(lines) {
	return ["v1", ...lines.slice(0, 50).map((l) => `${l.handle}~${l.colorwayId}~${l.size}~${l.quantity}`)].join("|");
}
/** Stable id for a line, used by update/remove forms. */
var lineKey = (handle, colorwayId, size) => `${handle}~${colorwayId}~${size}`;
//#endregion
//#region src/lib/cart/local.ts
/**
* Cart built from cookie references plus the live catalogue.
*
* The cookie stores WHAT is in the cart. Everything a shopper sees — price,
* title, stock — is resolved here, fresh, on every render. So a stale or
* tampered cookie can misrepresent quantity at worst, never price.
*
* This is also what makes the cart self-correcting: if a product is delisted
* or sells out between visits, the line reflects that instead of silently
* carrying an old price to checkout.
*/
function buildLocalCart(cookieLines, products) {
	const byHandle = new Map(products.map((p) => [p.handle, p]));
	const lines = [];
	let subtotal = 0;
	let dropped = 0;
	for (const ref of cookieLines) {
		const product = byHandle.get(ref.handle);
		if (!product) {
			dropped += 1;
			continue;
		}
		const colorway = product.colorways.find((c) => c.id === ref.colorwayId);
		if (!colorway) {
			dropped += 1;
			continue;
		}
		const available = colorway.sizes.find((s) => s.size === ref.size)?.inventory ?? 0;
		const unit = product.price.amount;
		const quantity = Math.min(ref.quantity, 10);
		const image = colorway.images?.find((i) => i.view === "front");
		lines.push({
			id: lineKey(product.handle, colorway.id, ref.size),
			handle: product.handle,
			colorwayId: colorway.id,
			size: ref.size,
			quantity,
			title: product.title,
			colorName: colorway.name,
			unitPrice: product.price,
			linePrice: {
				amount: unit * quantity,
				currency: product.price.currency
			},
			imageSrc: image?.src,
			imageAlt: image?.alt,
			hex: colorway.hex,
			hexAlt: colorway.hexAlt,
			shape: product.shape,
			available
		});
		subtotal += unit * quantity;
	}
	return {
		lines,
		itemCount: lines.reduce((n, l) => n + l.quantity, 0),
		subtotal: {
			amount: subtotal,
			currency: "USD"
		},
		checkoutUrl: null,
		backend: "local",
		...dropped > 0 ? { warning: `${dropped} item${dropped === 1 ? "" : "s"} no longer available and ${dropped === 1 ? "was" : "were"} removed.` } : {}
	};
}
/** Adds or increments a line, capped. Returns the new cookie lines. */
function addLine(existing, incoming) {
	const next = existing.map((l) => ({ ...l }));
	const match = next.find((l) => l.handle === incoming.handle && l.colorwayId === incoming.colorwayId && l.size === incoming.size);
	if (match) match.quantity = Math.min(match.quantity + incoming.quantity, 10);
	else next.push({
		...incoming,
		quantity: Math.min(incoming.quantity, 10)
	});
	return next;
}
function setQuantity(existing, key, quantity) {
	if (quantity <= 0) return removeLine(existing, key);
	return existing.map((l) => lineKey(l.handle, l.colorwayId, l.size) === key ? {
		...l,
		quantity: Math.min(quantity, 10)
	} : l);
}
function removeLine(existing, key) {
	return existing.filter((l) => lineKey(l.handle, l.colorwayId, l.size) !== key);
}
//#endregion
//#region src/lib/cart/shopify.ts
/**
* Shopify Cart API.
*
* Shopify owns the cart, and critically owns CHECKOUT: payment, tax, fraud
* screening and PCI scope all stay on their side of the line. We hold a cart
* id and hand the shopper a `checkoutUrl`. No card data ever reaches this app,
* which is the single most valuable property of the whole arrangement.
*/
var CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
          product { handle title }
        }
      }
    }
  }
`;
var CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;
var CART_QUERY = `
  query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }
`;
var CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;
var CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;
var CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;
var option = (opts, want) => opts.find((o) => o.name.toLowerCase() === want.toLowerCase())?.value ?? "";
function mapCart(raw, products) {
	const byHandle = new Map(products.map((p) => [p.handle, p]));
	return {
		lines: raw.lines.nodes.map((node) => {
			const m = node.merchandise;
			const colourName = option(m.selectedOptions, "Colour") || option(m.selectedOptions, "Color");
			const sizeRaw = option(m.selectedOptions, "Size");
			const size = SIZE_ORDER.find((s) => s === sizeRaw) ?? "M";
			const product = byHandle.get(m.product.handle);
			const colorway = product?.colorways.find((c) => c.name === colourName);
			const image = colorway?.images?.find((i) => i.view === "front");
			const unit = Math.round(Number.parseFloat(m.price.amount) * 100);
			return {
				id: node.id,
				handle: m.product.handle,
				colorwayId: colorway?.id ?? colourName,
				size,
				quantity: node.quantity,
				title: m.product.title,
				colorName: colourName,
				unitPrice: {
					amount: unit,
					currency: "USD"
				},
				linePrice: {
					amount: unit * node.quantity,
					currency: "USD"
				},
				imageSrc: image?.src,
				imageAlt: image?.alt,
				hex: colorway?.hex ?? "#B4B4AE",
				hexAlt: colorway?.hexAlt,
				shape: product?.shape ?? "tee",
				available: m.quantityAvailable ?? 0
			};
		}),
		itemCount: raw.totalQuantity,
		subtotal: {
			amount: Math.round(Number.parseFloat(raw.cost.subtotalAmount.amount) * 100),
			currency: "USD"
		},
		checkoutUrl: raw.checkoutUrl,
		backend: "shopify"
	};
}
function firstError(payload) {
	const e = payload?.userErrors?.[0];
	return e ? e.message : null;
}
async function fetchCart(cartId, products) {
	const data = await storefront(CART_QUERY, { id: cartId });
	return data.cart ? mapCart(data.cart, products) : null;
}
async function createCart(variantId, quantity, products) {
	const data = await storefront(CART_CREATE, { lines: [{
		merchandiseId: variantId,
		quantity
	}] });
	const err = firstError(data.cartCreate);
	if (err || !data.cartCreate.cart) throw new Error(err ?? "Could not create cart");
	return {
		cart: mapCart(data.cartCreate.cart, products),
		cartId: data.cartCreate.cart.id
	};
}
async function addToCart$1(cartId, variantId, quantity, products) {
	const data = await storefront(CART_LINES_ADD, {
		cartId,
		lines: [{
			merchandiseId: variantId,
			quantity
		}]
	});
	const err = firstError(data.cartLinesAdd);
	if (err || !data.cartLinesAdd.cart) throw new Error(err ?? "Could not add to cart");
	return mapCart(data.cartLinesAdd.cart, products);
}
async function updateCartLine(cartId, lineId, quantity, products) {
	const data = await storefront(CART_LINES_UPDATE, {
		cartId,
		lines: [{
			id: lineId,
			quantity
		}]
	});
	const err = firstError(data.cartLinesUpdate);
	if (err || !data.cartLinesUpdate.cart) throw new Error(err ?? "Could not update cart");
	return mapCart(data.cartLinesUpdate.cart, products);
}
async function removeCartLine(cartId, lineId, products) {
	const data = await storefront(CART_LINES_REMOVE, {
		cartId,
		lineIds: [lineId]
	});
	const err = firstError(data.cartLinesRemove);
	if (err || !data.cartLinesRemove.cart) throw new Error(err ?? "Could not remove line");
	return mapCart(data.cartLinesRemove.cart, products);
}
//#endregion
//#region src/lib/cart/index.ts
/**
* Cart seam.
*
* Shopify when configured — it owns the cart and, more importantly, checkout.
* A cookie-backed local cart otherwise, so the storefront is demonstrable
* without a store.
*
* Every write path falls back to the local cart on failure rather than
* throwing. Losing a cart is worse than losing sync.
*/
var secure = (url) => url.protocol === "https:";
/** Reads the current cart for display. */
async function readCart(cookies, products) {
	const all = products ?? (await loadProducts()).products;
	if (isShopifyConfigured()) {
		const cartId = cookies.get(CART_ID_COOKIE)?.value;
		if (!cartId) return {
			...EMPTY_CART,
			backend: "shopify"
		};
		try {
			const cart = await fetchCart(cartId, all);
			if (cart) return cart;
			cookies.delete(CART_ID_COOKIE, { path: "/" });
			return {
				...EMPTY_CART,
				backend: "shopify"
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`[cart] Shopify read failed:\n  ${message}`);
			return {
				...EMPTY_CART,
				backend: "shopify",
				warning: `Cart unavailable: ${message}`
			};
		}
	}
	return buildLocalCart(parseCartCookie(cookies.get(CART_COOKIE)?.value), all);
}
/** Resolves the Shopify variant id for a chosen colourway + size. */
function variantIdFor(products, req) {
	return (products.find((p) => p.handle === req.handle)?.colorways.find((c) => c.id === req.colorwayId))?.sizes.find((s) => s.size === req.size)?.variantId;
}
/**
* Validates against live stock before adding.
*
* The form already disables sold-out sizes, but a form is client-side and can
* be replayed. Anything that changes state re-checks server-side.
*/
function validateAdd(products, req) {
	const product = products.find((p) => p.handle === req.handle);
	if (!product) return {
		ok: false,
		reason: "That product is no longer available."
	};
	const colorway = product.colorways.find((c) => c.id === req.colorwayId);
	if (!colorway) return {
		ok: false,
		reason: "That colour is no longer available."
	};
	const stock = colorway.sizes.find((s) => s.size === req.size);
	if (!stock || stock.inventory <= 0) return {
		ok: false,
		reason: `${product.title} in ${colorway.name}, size ${req.size} is sold out.`
	};
	if (req.quantity < 1 || req.quantity > 10) return {
		ok: false,
		reason: `Choose between 1 and 10.`
	};
	return { ok: true };
}
async function addToCart(cookies, url, req) {
	const { products } = await loadProducts();
	const valid = validateAdd(products, req);
	if (!valid.ok) return {
		cart: await readCart(cookies, products),
		error: valid.reason
	};
	if (isShopifyConfigured()) {
		const variantId = variantIdFor(products, req);
		if (variantId) try {
			const cartId = cookies.get(CART_ID_COOKIE)?.value;
			if (cartId) return { cart: await addToCart$1(cartId, variantId, req.quantity, products) };
			const created = await createCart(variantId, req.quantity, products);
			cookies.set(CART_ID_COOKIE, created.cartId, cookieOptions(secure(url)));
			return { cart: created.cart };
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`[cart] Shopify add failed, using local cart:\n  ${message}`);
		}
	}
	const lines = addLine(parseCartCookie(cookies.get(CART_COOKIE)?.value), {
		handle: req.handle,
		colorwayId: req.colorwayId,
		size: req.size,
		quantity: req.quantity
	});
	cookies.set(CART_COOKIE, serialiseCartCookie(lines), cookieOptions(secure(url)));
	return { cart: buildLocalCart(lines, products) };
}
async function updateLine(cookies, url, id, quantity) {
	const { products } = await loadProducts();
	const capped = Math.max(0, Math.min(quantity, 10));
	if (isShopifyConfigured()) {
		const cartId = cookies.get(CART_ID_COOKIE)?.value;
		if (cartId) try {
			return capped === 0 ? await removeCartLine(cartId, id, products) : await updateCartLine(cartId, id, capped, products);
		} catch (error) {
			console.error(`[cart] Shopify update failed:\n  ${String(error)}`);
		}
	}
	const lines = setQuantity(parseCartCookie(cookies.get(CART_COOKIE)?.value), id, capped);
	cookies.set(CART_COOKIE, serialiseCartCookie(lines), cookieOptions(secure(url)));
	return buildLocalCart(lines, products);
}
async function removeFromCart(cookies, url, id) {
	const { products } = await loadProducts();
	if (isShopifyConfigured()) {
		const cartId = cookies.get(CART_ID_COOKIE)?.value;
		if (cartId) try {
			return await removeCartLine(cartId, id, products);
		} catch (error) {
			console.error(`[cart] Shopify remove failed:\n  ${String(error)}`);
		}
	}
	const lines = removeLine(parseCartCookie(cookies.get(CART_COOKIE)?.value), id);
	cookies.set(CART_COOKIE, serialiseCartCookie(lines), cookieOptions(secure(url)));
	return buildLocalCart(lines, products);
}
//#endregion
export { updateLine as i, readCart as n, removeFromCart as r, addToCart as t };
