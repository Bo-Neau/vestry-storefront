/**
 * Deployment environment.
 *
 * Vercel sets VERCEL_ENV to "production", "preview" or "development", and
 * gives every branch its own preview URL. Those preview URLs are real,
 * reachable and — left alone — indexable, which means a client-review branch
 * can end up in search results competing with the live site.
 *
 * Anything that is not production is therefore marked noindex and disallowed
 * in robots.txt.
 */
export type DeployEnv = "production" | "preview" | "development";

function read(key: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)?.[key];
  const v = (fromProcess ?? fromMeta ?? "").trim();
  return v.length > 0 ? v : undefined;
}

export function deployEnv(): DeployEnv {
  const vercelEnv = read("VERCEL_ENV");
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";
  if (vercelEnv) return "development";

  // Not on Vercel. Treat an explicitly set SITE_URL plus a production build
  // as production; otherwise assume development.
  if (read("SITE_URL") && !import.meta.env.DEV) return "production";
  return "development";
}

/**
 * Whether search engines should index this deployment.
 *
 * Defaults to false. A deployment has to prove it is production to be
 * indexable, rather than the reverse — the failure mode of guessing wrong in
 * that direction is only "not indexed yet", which is recoverable. Guessing
 * wrong the other way puts staging URLs in Google.
 */
export const isIndexable = (): boolean => deployEnv() === "production";
