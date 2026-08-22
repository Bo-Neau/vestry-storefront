import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as loadProducts } from "./source_DNojBtZB.mjs";
//#region src/pages/sitemap.xml.ts
var sitemap_xml_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
/**
* Sitemap, generated from live data.
*
* Only canonical URLs: one entry per style, one per collection. No filtered
* views and no colourway variants — those are combinatorially infinite and
* canonicalised elsewhere, so listing them would invite exactly the crawl
* waste the canonical tags exist to prevent.
*/
var COLLECTIONS = [
	"all",
	"t-shirts",
	"shirts",
	"knitwear",
	"trousers"
];
var escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var GET = async ({ site }) => {
	const base = (site ?? new URL("https://vestry.example")).origin;
	const { products } = await loadProducts();
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
		{
			loc: `${base}/`,
			priority: "1.0",
			freq: "daily"
		},
		{
			loc: `${base}/cart`,
			priority: "0.1",
			freq: "never"
		},
		...COLLECTIONS.map((c) => ({
			loc: `${base}/collections/${c}`,
			priority: "0.8",
			freq: "daily"
		})),
		...products.map((p) => ({
			loc: `${base}/products/${p.handle}`,
			priority: "0.9",
			freq: "weekly"
		}))
	].map((u) => `  <url>
    <loc>${escape(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
	return new Response(body, { headers: {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600"
	} });
};
//#endregion
//#region \0virtual:astro:page:src/pages/sitemap.xml@_@ts
var page = () => sitemap_xml_exports;
//#endregion
export { page };
