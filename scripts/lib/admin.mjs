/**
 * Admin API helper for setup scripts.
 *
 * The Admin token is a secret with read/write access to the whole store. It is
 * used ONLY here, never at runtime, and never sent to a browser.
 */
const DEFAULT_VERSION = "2026-07";

export function config() {
  const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").trim()
    .replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const adminToken = (process.env.SHOPIFY_ADMIN_TOKEN ?? "").trim();
  const storefrontToken = (process.env.SHOPIFY_STOREFRONT_TOKEN ?? "").trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION ?? "").trim() || DEFAULT_VERSION;
  return { domain, adminToken, storefrontToken, apiVersion };
}

/** Non-fatal check, so the doctor can report every problem in one run. */
export function checkAdminConfig() {
  const c = config();
  const missing = [];
  if (!c.domain) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!c.adminToken) missing.push("SHOPIFY_ADMIN_TOKEN");
  if (missing.length) {
    return { ok: false, reason: `missing in .env: ${missing.join(", ")}`, config: c };
  }
  if (!c.adminToken.startsWith("shpat_")) {
    return {
      ok: false,
      reason: "SHOPIFY_ADMIN_TOKEN does not look like an Admin API token (expected 'shpat_' prefix)",
      config: c,
    };
  }
  return { ok: true, config: c };
}

/** Fatal check, for setup/seed where there is nothing to do without it. */
export function requireAdmin() {
  const checked = checkAdminConfig();
  if (!checked.ok) {
    console.error(`\n${checked.reason}`);
    console.error("Copy .env.example to .env and fill it in.");
    console.error("See docs/shopify-setup.md for where each value comes from.\n");
    process.exit(1);
  }
  return checked.config;
}

export async function admin(query, variables = {}) {
  const checked = checkAdminConfig();
  if (!checked.ok) throw new Error(checked.reason);
  const c = checked.config;
  const url = `https://${c.domain}/admin/api/${c.apiVersion}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": c.adminToken,
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `Admin API rejected the token (HTTP ${res.status}). Check ` +
      `SHOPIFY_ADMIN_TOKEN, and that the app has the scopes listed in ` +
      `docs/shopify-setup.md.`,
    );
  }
  if (!res.ok) {
    throw new Error(`Admin API HTTP ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(`Admin API error: ${body.errors[0].message}`);
  }
  return body.data;
}

export async function storefrontProbe(query, variables = {}) {
  const c = config();
  if (!c.domain || !c.storefrontToken) return { ok: false, reason: "not configured" };
  const url = `https://${c.domain}/api/${c.apiVersion}/graphql.json`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": c.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const body = await res.json();
    if (body.errors?.length) return { ok: false, reason: body.errors[0].message };
    return { ok: true, data: body.data };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

/** Collects userErrors from a mutation payload into a readable string. */
export function userErrors(payload) {
  const errs = payload?.userErrors ?? [];
  if (!errs.length) return null;
  return errs.map((e) => `${(e.field ?? []).join(".")}: ${e.message}`).join("; ");
}

export const tick = (ok) => (ok ? "✓" : "✗");
