//#region src/lib/env.ts
var DEFAULT_API_VERSION = "2026-07";
function read(key) {
	const fromProcess = typeof process !== "undefined" ? process.env?.[key] : void 0;
	const fromMeta = Object.assign({
		"ASSETS_PREFIX": void 0,
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SITE": "https://vestry.example",
		"SSR": true
	}, { _: "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/node_modules/.bin/astro" })?.[key];
	const value = (fromProcess ?? fromMeta ?? "").trim();
	return value.length > 0 ? value : void 0;
}
function shopifyConfig() {
	const domain = read("SHOPIFY_STORE_DOMAIN");
	const token = read("SHOPIFY_STOREFRONT_TOKEN");
	if (!domain || !token) return null;
	if (token.startsWith("shpat_")) throw new Error("SHOPIFY_STOREFRONT_TOKEN looks like an Admin API token (shpat_...). Admin tokens must never be used for storefront requests — they grant read/write access to the whole store. Put the Admin token in SHOPIFY_ADMIN_TOKEN (used only by scripts/) and use the public Storefront API token here.");
	return {
		domain: domain.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
		token,
		apiVersion: read("SHOPIFY_API_VERSION") ?? DEFAULT_API_VERSION
	};
}
function isShopifyConfigured() {
	try {
		return shopifyConfig() !== null;
	} catch {
		return true;
	}
}
//#endregion
//#region src/data/catalogue.ts
var usd = (dollars) => ({
	amount: dollars * 100,
	currency: "USD"
});
/** Stock per size, in SIZE_ORDER. A 0 means genuinely sold out. */
var stock = (xs, s, m, l, xl, xxl) => [
	{
		size: "XS",
		inventory: xs
	},
	{
		size: "S",
		inventory: s
	},
	{
		size: "M",
		inventory: m
	},
	{
		size: "L",
		inventory: l
	},
	{
		size: "XL",
		inventory: xl
	},
	{
		size: "XXL",
		inventory: xxl
	}
];
var reviewSeq = 0;
var rev = (rating, title, body, author, date, heightBand, sizePurchased, fitFeedback) => ({
	id: `r${++reviewSeq}`,
	rating,
	title,
	body,
	author,
	verified: true,
	date,
	heightBand,
	sizePurchased,
	fitFeedback
});
var PRODUCTS = [
	{
		id: "STYLE-TEE-001",
		handle: "everyday-crew",
		title: "The Everyday Crew",
		category: "T-shirts",
		shape: "tee",
		price: usd(38),
		summary: "Mid-weight organic cotton, cut to sit close without clinging.",
		description: "Our baseline tee, revised over four seasons. Combed organic cotton at 180gsm — heavy enough to hold its shape through the wash, light enough to layer under a shirt. The neck rib is knitted on the same machine as the body so it recovers instead of stretching out.",
		attributes: {
			fit: "Regular",
			neckline: "Crew",
			sleeveLength: "Short",
			fabric: "100% organic cotton",
			fabricWeightGsm: 180,
			targetGender: "Unisex",
			features: [
				"Pre-shrunk",
				"Self-fabric neck rib",
				"Single-needle hem"
			]
		},
		fit: {
			modelHeightCm: 185,
			modelSizeWorn: "L",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-tops",
		colorways: [
			{
				id: "tee1-white",
				name: "Chalk",
				hex: "#F2F0EA",
				sizes: stock(6, 14, 4, 11, 5, 2),
				images: [{
					src: "/sample/everyday-crew-chalk-front.png",
					alt: "The Everyday Crew in Chalk, front view",
					width: 1200,
					height: 1560,
					view: "front"
				}]
			},
			{
				id: "tee1-black",
				name: "Ink",
				hex: "#1E1E1C",
				sizes: stock(4, 9, 12, 8, 6, 3)
			},
			{
				id: "tee1-oat",
				name: "Heathered Oat",
				hex: "#C9BFAB",
				hexAlt: "#DCD4C4",
				sizes: stock(0, 5, 7, 4, 0, 0)
			},
			{
				id: "tee1-slate",
				name: "Slate",
				hex: "#5A6068",
				sizes: stock(3, 8, 9, 7, 4, 1)
			},
			{
				id: "tee1-olive",
				name: "Faded Olive",
				hex: "#6E7355",
				sizes: stock(2, 4, 0, 6, 3, 0)
			}
		],
		care: [
			"Machine wash cold, like colours",
			"Tumble dry low",
			"Warm iron if needed",
			"Do not bleach"
		],
		details: [
			"Made in Portugal",
			"OCS certified organic cotton",
			"Model wears size L"
		],
		reviews: [
			rev(5, "Replaced my whole drawer", "Bought two, came back for four more. Holds shape after a dozen washes, which is more than I can say for the ones I was buying before.", "Daniel R.", "2026-07-14", "5'10\"–6'0\"", "L", "true"),
			rev(5, "The neck actually recovers", "This is the detail nobody else gets right. Six weeks in and the collar still sits flat.", "Priya M.", "2026-06-28", "5'4\"–5'6\"", "S", "true"),
			rev(4, "Good, slightly short in the body", "Fit through the chest is spot on but I'd like another inch of length. Fine tucked in.", "Marcus T.", "2026-06-02", "6'1\" or above", "L", "true"),
			rev(4, "Chalk is more cream than white", "Not a complaint exactly, but worth knowing if you're matching it to something. Quality is excellent.", "Sena K.", "2026-05-19", "5'7\"–5'9\"", "M", "true"),
			rev(3, "Fine but not remarkable", "It's a well-made tee. At this price I expected to be more impressed than I am.", "Tom B.", "2026-05-03", "5'10\"–6'0\"", "M", "true"),
			rev(2, "Shrank more than 'pre-shrunk' suggests", "Lost close to an inch of length in the first wash despite following the care label. Sizing up would have helped.", "Alina V.", "2026-04-21", "5'4\"–5'6\"", "S", "small")
		]
	},
	{
		id: "STYLE-TEE-002",
		handle: "boxy-pocket-tee",
		title: "Boxy Pocket Tee",
		category: "T-shirts",
		shape: "tee",
		price: usd(48),
		summary: "Heavy 220gsm jersey with a deliberately square cut.",
		description: "A wider body and a dropped shoulder, cut from 220gsm loopback jersey that stands away from the body. The patch pocket is set on the bias so it lies flat instead of curling. Sized generously — if you want a closer fit, take a size down.",
		attributes: {
			fit: "Relaxed",
			neckline: "Crew",
			sleeveLength: "Short",
			fabric: "100% heavyweight cotton",
			fabricWeightGsm: 220,
			targetGender: "Unisex",
			features: [
				"Dropped shoulder",
				"Bias-set patch pocket",
				"Twin-needle hem"
			]
		},
		fit: {
			modelHeightCm: 178,
			modelSizeWorn: "M",
			runsTrueToSize: "large"
		},
		sizeChartId: "chart-tops",
		colorways: [
			{
				id: "tee2-sand",
				name: "Sand",
				hex: "#D6C9B0",
				sizes: stock(0, 7, 0, 6, 3, 0)
			},
			{
				id: "tee2-black",
				name: "Ink",
				hex: "#1E1E1C",
				sizes: stock(0, 6, 0, 9, 4, 0)
			},
			{
				id: "tee2-rust",
				name: "Burnt Rust",
				hex: "#9A5A3C",
				sizes: stock(0, 3, 0, 4, 2, 0)
			}
		],
		care: [
			"Machine wash cold",
			"Dry flat to preserve the shape",
			"Do not tumble dry"
		],
		details: [
			"Made in Portugal",
			"Garment washed",
			"Model wears size M"
		],
		reviews: [
			rev(5, "Exactly the boxy cut I wanted", "Most 'relaxed' tees are just bigger all over. This one is actually cut square. Sized down to M and it's perfect.", "Jonah L.", "2026-07-02", "5'10\"–6'0\"", "M", "large"),
			rev(4, "Runs big — size down", "Ordered L as usual and it was enormous. The M is right. Fabric is genuinely lovely.", "Rae C.", "2026-06-11", "5'7\"–5'9\"", "L", "large"),
			rev(4, "Heavy in a good way", "Feels like it'll last years. Takes a while to dry, which the care label warns about.", "Idris N.", "2026-05-27", "6'1\" or above", "XL", "large"),
			rev(2, "Too cropped for me", "The boxy cut means it's short. On a taller frame it reads more cropped than the photos suggest.", "Peter H.", "2026-05-08", "6'1\" or above", "L", "large")
		]
	},
	{
		id: "STYLE-TEE-003",
		handle: "long-sleeve-henley",
		title: "Long-Sleeve Henley",
		category: "T-shirts",
		shape: "tee",
		price: usd(62),
		compareAtPrice: usd(78),
		summary: "Waffle-knit henley with a four-button placket.",
		description: "Waffle-knit cotton with a little more give than a flat jersey, so it works as a mid-layer without pulling. Four corozo buttons on a reinforced placket. Cuffs are ribbed deep enough to push up and stay put.",
		attributes: {
			fit: "Regular",
			neckline: "Henley",
			sleeveLength: "Long",
			fabric: "94% cotton, 6% elastane",
			fabricWeightGsm: 200,
			targetGender: "Men",
			features: [
				"Corozo buttons",
				"Reinforced placket",
				"Deep ribbed cuffs"
			]
		},
		fit: {
			modelHeightCm: 183,
			modelSizeWorn: "M",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-tops",
		colorways: [
			{
				id: "tee3-oat",
				name: "Heathered Oat",
				hex: "#C9BFAB",
				hexAlt: "#DCD4C4",
				sizes: stock(3, 8, 10, 7, 4, 0)
			},
			{
				id: "tee3-navy",
				name: "Deep Navy",
				hex: "#252F45",
				sizes: stock(2, 6, 9, 8, 5, 0)
			},
			{
				id: "tee3-clay",
				name: "Clay",
				hex: "#A8735C",
				sizes: stock(0, 2, 4, 3, 0, 0)
			}
		],
		care: [
			"Machine wash cold",
			"Tumble dry low",
			"Do not iron the placket directly"
		],
		details: [
			"Made in Portugal",
			"Corozo nut buttons",
			"Model wears size M"
		],
		reviews: [
			rev(5, "Best henley I've owned", "The placket doesn't gape, which is the whole problem with henleys. Worth the money even before the discount.", "Callum S.", "2026-07-20", "5'10\"–6'0\"", "M", "true"),
			rev(5, "Great under a jacket", "Waffle texture gives it more presence than a plain long sleeve. Sleeve length is generous.", "Wei Z.", "2026-06-30", "5'7\"–5'9\"", "S", "true"),
			rev(4, "Slight pilling at the cuffs", "After two months there's a bit of pilling where the cuffs rub. Otherwise excellent.", "Owen F.", "2026-06-09", "6'1\" or above", "L", "true"),
			rev(3, "Elastane makes it warmer than expected", "Comfortable but I run hot in it. More of a winter piece than the listing suggests.", "Tobias G.", "2026-05-15", "5'10\"–6'0\"", "M", "true")
		]
	},
	{
		id: "STYLE-TEE-004",
		handle: "ribbed-tank",
		title: "Ribbed Tank",
		category: "T-shirts",
		shape: "tee",
		price: usd(32),
		summary: "Fine-gauge rib with a close, high-armhole cut.",
		description: "A 2x1 rib knitted fine enough to layer invisibly. The armhole sits high and the strap is cut narrow, so it disappears under a shirt rather than showing at the shoulder.",
		attributes: {
			fit: "Slim",
			neckline: "Crew",
			sleeveLength: "Sleeveless",
			fabric: "95% cotton, 5% elastane",
			fabricWeightGsm: 160,
			targetGender: "Unisex",
			features: [
				"2x1 rib",
				"High armhole",
				"Narrow strap"
			]
		},
		fit: {
			modelHeightCm: 172,
			modelSizeWorn: "S",
			runsTrueToSize: "small"
		},
		sizeChartId: "chart-tops",
		colorways: [{
			id: "tee4-white",
			name: "Chalk",
			hex: "#F2F0EA",
			sizes: stock(8, 12, 10, 6, 0, 0)
		}, {
			id: "tee4-black",
			name: "Ink",
			hex: "#1E1E1C",
			sizes: stock(7, 11, 9, 5, 0, 0)
		}],
		care: [
			"Machine wash cold",
			"Dry flat",
			"Do not tumble dry"
		],
		details: [
			"Made in Portugal",
			"Designed to layer",
			"Model wears size S"
		],
		reviews: [
			rev(4, "Genuinely invisible under a shirt", "That's what I bought it for and it delivers. Rib is fine and doesn't show through.", "Nadia P.", "2026-07-08", "5'4\"–5'6\"", "S", "small"),
			rev(4, "Take a size up", "The slim cut is very slim. My usual S was tight across the chest; M is right.", "Leo A.", "2026-06-14", "5'7\"–5'9\"", "S", "small"),
			rev(3, "Rides up a little", "Fit is good but it creeps up over the day if I'm moving around.", "Fern D.", "2026-05-22", "5'4\"–5'6\"", "XS", "small")
		]
	},
	{
		id: "STYLE-SHIRT-001",
		handle: "oxford-button-down",
		title: "Oxford Button-Down",
		category: "Shirts",
		shape: "shirt",
		price: usd(98),
		summary: "Washed oxford cotton with an unfused, roll-friendly collar.",
		description: "Woven oxford cotton, garment-washed so it arrives soft instead of stiff. The collar is unfused — no interlining — so it rolls naturally rather than standing up like a board. Box pleat at the back for movement across the shoulders.",
		attributes: {
			fit: "Regular",
			neckline: "Collared",
			sleeveLength: "Long",
			fabric: "100% cotton oxford",
			fabricWeightGsm: 140,
			targetGender: "Men",
			features: [
				"Unfused collar",
				"Box pleat back",
				"Mother-of-pearl buttons",
				"Garment washed"
			]
		},
		fit: {
			modelHeightCm: 185,
			modelSizeWorn: "L",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-tops",
		colorways: [
			{
				id: "sh1-white",
				name: "Chalk",
				hex: "#F2F0EA",
				sizes: stock(4, 10, 12, 9, 5, 2)
			},
			{
				id: "sh1-blue",
				name: "Oxford Blue",
				hex: "#8FA6C4",
				sizes: stock(3, 9, 0, 8, 4, 1)
			},
			{
				id: "sh1-stripe",
				name: "Blue Stripe",
				hex: "#B9C9DC",
				hexAlt: "#F2F0EA",
				sizes: stock(2, 6, 7, 5, 3, 0)
			},
			{
				id: "sh1-sage",
				name: "Pale Sage",
				hex: "#B4BFA8",
				sizes: stock(0, 4, 5, 3, 0, 0)
			}
		],
		care: [
			"Machine wash cold",
			"Hang to dry",
			"Warm iron while slightly damp"
		],
		details: [
			"Made in Portugal",
			"Mother-of-pearl buttons",
			"Model wears size L"
		],
		reviews: [
			rev(5, "The collar roll is right", "This is the whole reason to buy an unfused oxford and they've nailed it. Sits properly with or without a tie.", "Henry O.", "2026-07-25", "6'1\" or above", "L", "true"),
			rev(5, "Soft from the first wear", "No break-in period at all. The garment wash makes a real difference.", "Sam W.", "2026-07-01", "5'10\"–6'0\"", "M", "true"),
			rev(4, "Sleeves slightly long", "Body fits well, sleeves need a small alteration on my arms. Standard problem for me.", "Raj K.", "2026-06-18", "5'7\"–5'9\"", "M", "true"),
			rev(4, "Great shirt, buttons are delicate", "Lost a button to a washing machine within a month. Mother-of-pearl is lovely but fragile.", "Elise B.", "2026-05-30", "5'4\"–5'6\"", "S", "true"),
			rev(2, "Wrinkles badly", "Unfused and unironed means it looks rumpled by lunchtime. Beautiful fabric, high maintenance.", "Gordon M.", "2026-05-11", "5'10\"–6'0\"", "L", "true")
		]
	},
	{
		id: "STYLE-SHIRT-002",
		handle: "camp-collar-shirt",
		title: "Camp Collar Shirt",
		category: "Shirts",
		shape: "shirt",
		price: usd(88),
		summary: "Open-collar short sleeve in a loose cotton-linen weave.",
		description: "A cotton-linen blend woven loosely enough to move air. The camp collar is cut to sit open and flat without gaping. Straight hem, so it works untucked without looking like a tucked shirt that escaped.",
		attributes: {
			fit: "Relaxed",
			neckline: "Collared",
			sleeveLength: "Short",
			fabric: "55% linen, 45% cotton",
			fabricWeightGsm: 150,
			targetGender: "Unisex",
			features: [
				"Camp collar",
				"Straight hem",
				"Chest patch pocket"
			]
		},
		fit: {
			modelHeightCm: 180,
			modelSizeWorn: "M",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-tops",
		colorways: [
			{
				id: "sh2-ecru",
				name: "Ecru",
				hex: "#E4DCC8",
				sizes: stock(0, 7, 0, 6, 3, 0)
			},
			{
				id: "sh2-teal",
				name: "Faded Teal",
				hex: "#547A78",
				sizes: stock(0, 5, 0, 5, 2, 0)
			},
			{
				id: "sh2-black",
				name: "Ink",
				hex: "#1E1E1C",
				sizes: stock(0, 3, 0, 4, 2, 0)
			}
		],
		care: [
			"Machine wash cold",
			"Hang to dry",
			"Cool iron"
		],
		details: [
			"Made in Portugal",
			"European linen",
			"Model wears size M"
		],
		reviews: [
			rev(5, "Perfect summer shirt", "Cool, drapes well, collar stays put. Wore it every week in August.", "Mateo R.", "2026-07-18", "5'10\"–6'0\"", "M", "true"),
			rev(4, "Linen creases, as linen does", "No surprises if you've worn linen before. If you haven't, know what you're buying.", "Jo T.", "2026-06-25", "5'4\"–5'6\"", "S", "true"),
			rev(4, "Collar sits beautifully", "A lot of camp collars gape at the neck. This one doesn't.", "Ana L.", "2026-06-04", "5'7\"–5'9\"", "M", "true")
		]
	},
	{
		id: "STYLE-SHIRT-003",
		handle: "cotton-overshirt",
		title: "Cotton Overshirt",
		category: "Shirts",
		shape: "shirt",
		price: usd(148),
		summary: "Shirt-jacket in a dense cotton twill, cut to layer over knitwear.",
		description: "Somewhere between a shirt and a light jacket. Dense cotton twill with a slight peach finish, cut wide enough through the chest and armhole to go over a crew-neck sweater without pulling. Two flap pockets, horn buttons.",
		attributes: {
			fit: "Oversized",
			neckline: "Collared",
			sleeveLength: "Long",
			fabric: "100% cotton twill",
			fabricWeightGsm: 280,
			targetGender: "Unisex",
			features: [
				"Horn buttons",
				"Twin flap pockets",
				"Wide armhole",
				"Peached finish"
			]
		},
		fit: {
			modelHeightCm: 183,
			modelSizeWorn: "M",
			runsTrueToSize: "large"
		},
		sizeChartId: "chart-tops",
		colorways: [{
			id: "sh3-stone",
			name: "Stone",
			hex: "#B0A899",
			sizes: stock(0, 6, 8, 6, 3, 1)
		}, {
			id: "sh3-brown",
			name: "Dark Cocoa",
			hex: "#4A3A31",
			sizes: stock(0, 4, 6, 5, 2, 0)
		}],
		care: [
			"Machine wash cold",
			"Hang to dry",
			"Warm iron"
		],
		details: [
			"Made in Portugal",
			"Genuine horn buttons",
			"Model wears size M"
		],
		reviews: [
			rev(5, "Wears three seasons", "Over a tee in spring, over a sweater in autumn. Cut is generous enough that layering actually works.", "Bruno C.", "2026-07-22", "5'10\"–6'0\"", "M", "large"),
			rev(4, "Sizes very generously", "I'm normally L and the M is roomy. Read the fit note — they're not exaggerating.", "Kit S.", "2026-06-16", "5'7\"–5'9\"", "M", "large"),
			rev(4, "Heavy but not stiff", "The peached finish stops it feeling like workwear canvas. Softens further with washing.", "Yusuf A.", "2026-05-28", "6'1\" or above", "L", "large")
		]
	},
	{
		id: "STYLE-KNIT-001",
		handle: "merino-crew",
		title: "Merino Crew Neck",
		category: "Knitwear",
		shape: "knit",
		price: usd(158),
		summary: "Fine-gauge extra-fine merino, fully fashioned.",
		description: "Extra-fine merino at a 14-gauge knit — thin enough for a shirt underneath, warm enough on its own. Fully fashioned, meaning the panels are knitted to shape rather than cut from a sheet, so the shoulder seams sit where your shoulders are.",
		attributes: {
			fit: "Regular",
			neckline: "Crew",
			sleeveLength: "Long",
			fabric: "100% extra-fine merino wool",
			fabricWeightGsm: 240,
			targetGender: "Unisex",
			features: [
				"14-gauge knit",
				"Fully fashioned",
				"Ribbed cuffs and welt"
			]
		},
		fit: {
			modelHeightCm: 185,
			modelSizeWorn: "L",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-knitwear",
		colorways: [
			{
				id: "kn1-navy",
				name: "Deep Navy",
				hex: "#252F45",
				sizes: stock(3, 8, 11, 8, 4, 2)
			},
			{
				id: "kn1-grey",
				name: "Mid Grey Melange",
				hex: "#8A8A85",
				hexAlt: "#A5A5A0",
				sizes: stock(2, 7, 0, 7, 3, 1)
			},
			{
				id: "kn1-camel",
				name: "Camel",
				hex: "#B08A5C",
				sizes: stock(1, 5, 7, 5, 2, 0)
			},
			{
				id: "kn1-forest",
				name: "Forest",
				hex: "#33463A",
				sizes: stock(0, 3, 5, 4, 0, 0)
			}
		],
		care: [
			"Hand wash cool or wool cycle",
			"Dry flat, away from heat",
			"Do not tumble dry",
			"Store folded, not hung"
		],
		details: [
			"Knitted in Scotland",
			"Mulesing-free merino",
			"Model wears size L"
		],
		reviews: [
			rev(5, "Worth every penny", "Fully fashioned makes a visible difference in how it hangs. Third season and no pilling.", "Alistair D.", "2026-07-26", "6'1\" or above", "L", "true"),
			rev(5, "Thin but warm", "Wears under a jacket without bulk. Exactly what I wanted from a merino crew.", "Hana I.", "2026-07-05", "5'4\"–5'6\"", "S", "true"),
			rev(5, "Colour is accurate", "Navy is a proper deep navy, not a washed-out blue. Photos are honest.", "Ravi S.", "2026-06-21", "5'10\"–6'0\"", "M", "true"),
			rev(4, "Needs careful washing", "No shortcuts — it's wool. Followed the label and it's held up perfectly.", "Greta N.", "2026-06-02", "5'7\"–5'9\"", "M", "true"),
			rev(3, "Snagged easily", "Fine gauge means it catches. Mine picked up a pull on a bag zip within weeks.", "Felix H.", "2026-05-14", "5'10\"–6'0\"", "L", "true")
		]
	},
	{
		id: "STYLE-KNIT-002",
		handle: "fisherman-cable-knit",
		title: "Fisherman Cable Knit",
		category: "Knitwear",
		shape: "knit",
		price: usd(198),
		summary: "Heavy undyed wool in a traditional cable and honeycomb pattern.",
		description: "Knitted in undyed wool that keeps its natural lanolin, so it sheds light rain. Traditional cable panels flanked by honeycomb stitch. Substantial — this is an outer layer in all but the coldest weather.",
		attributes: {
			fit: "Relaxed",
			neckline: "Crew",
			sleeveLength: "Long",
			fabric: "100% undyed British wool",
			fabricWeightGsm: 480,
			targetGender: "Unisex",
			features: [
				"Hand-framed cables",
				"Undyed yarn",
				"Saddle shoulder"
			]
		},
		fit: {
			modelHeightCm: 180,
			modelSizeWorn: "M",
			runsTrueToSize: "large"
		},
		sizeChartId: "chart-knitwear",
		colorways: [{
			id: "kn2-natural",
			name: "Undyed Natural",
			hex: "#DBD2BE",
			sizes: stock(0, 4, 6, 5, 2, 1)
		}, {
			id: "kn2-moss",
			name: "Moss",
			hex: "#6A6B4E",
			sizes: stock(0, 2, 4, 3, 1, 0)
		}],
		care: [
			"Hand wash cool only",
			"Dry flat",
			"Do not wring",
			"Store folded"
		],
		details: [
			"Hand-framed in Ireland",
			"Undyed, minimally processed wool",
			"Model wears size M"
		],
		reviews: [
			rev(5, "A lifetime piece", "Heavy, warm, beautifully made. The kind of thing you hand on rather than replace.", "Niamh B.", "2026-07-12", "5'4\"–5'6\"", "S", "large"),
			rev(4, "Very warm — and very big", "Sized down and still roomy. Too warm for indoors, perfect outside.", "Duncan F.", "2026-06-27", "5'10\"–6'0\"", "M", "large"),
			rev(3, "Scratchy at first", "Undyed wool is less processed, which means it's coarser. Softens after a few wears but be ready for it.", "Mira J.", "2026-05-31", "5'7\"–5'9\"", "M", "large")
		]
	},
	{
		id: "STYLE-KNIT-003",
		handle: "lambswool-v-neck",
		title: "Lambswool V-Neck",
		category: "Knitwear",
		shape: "knit",
		price: usd(128),
		compareAtPrice: usd(160),
		summary: "Close-fitting lambswool with a shallow V and a fine rib.",
		description: "Cut close, with a shallow V that shows a shirt collar without exposing much chest. Lambswool spun in the Scottish Borders and knitted at a 12-gauge, so it holds a defined rib at the cuff and welt.",
		attributes: {
			fit: "Slim",
			neckline: "V-neck",
			sleeveLength: "Long",
			fabric: "100% lambswool",
			fabricWeightGsm: 260,
			targetGender: "Men",
			features: [
				"12-gauge knit",
				"Shallow V",
				"Defined rib"
			]
		},
		fit: {
			modelHeightCm: 183,
			modelSizeWorn: "M",
			runsTrueToSize: "small"
		},
		sizeChartId: "chart-knitwear",
		colorways: [
			{
				id: "kn3-charcoal",
				name: "Charcoal",
				hex: "#3D3D3C",
				sizes: stock(4, 9, 0, 6, 3, 0)
			},
			{
				id: "kn3-oatmeal",
				name: "Oatmeal",
				hex: "#CDC2A8",
				sizes: stock(3, 7, 0, 5, 2, 0)
			},
			{
				id: "kn3-burgundy",
				name: "Burgundy",
				hex: "#6B2A32",
				sizes: stock(0, 4, 0, 3, 1, 0)
			}
		],
		care: [
			"Wool cycle or hand wash cool",
			"Dry flat",
			"Do not tumble dry"
		],
		details: [
			"Knitted in Scotland",
			"Scottish Borders lambswool",
			"Model wears size M"
		],
		reviews: [
			rev(4, "Take a size up", "Slim means slim. I'm usually M and needed L for any comfort over a shirt.", "Edward P.", "2026-07-16", "5'10\"–6'0\"", "M", "small"),
			rev(4, "V is the right depth", "Shows a collar and nothing else. Hard to find.", "Thomas Q.", "2026-06-19", "5'7\"–5'9\"", "S", "small"),
			rev(3, "Snug across the shoulders", "Fine standing still, tight reaching forward. Would size up again.", "Louis M.", "2026-05-25", "6'1\" or above", "L", "small")
		]
	},
	{
		id: "STYLE-TROU-001",
		handle: "pleated-wide-trouser",
		title: "Pleated Wide Trouser",
		category: "Trousers",
		shape: "trouser",
		price: usd(138),
		summary: "Single-pleat wide leg in a dry-handle cotton twill.",
		description: "A single forward pleat and a wide, straight leg that breaks once over the shoe. Cut from a dry-handle twill with almost no stretch, so the line stays clean rather than clinging. Side adjusters instead of belt loops.",
		attributes: {
			fit: "Relaxed",
			fabric: "100% cotton twill",
			fabricWeightGsm: 300,
			targetGender: "Unisex",
			features: [
				"Single forward pleat",
				"Side adjusters",
				"Unfinished hem",
				"No stretch"
			]
		},
		fit: {
			modelHeightCm: 185,
			modelSizeWorn: "M",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-trousers",
		colorways: [
			{
				id: "tr1-stone",
				name: "Stone",
				hex: "#B0A899",
				sizes: stock(0, 6, 8, 7, 4, 1)
			},
			{
				id: "tr1-navy",
				name: "Deep Navy",
				hex: "#252F45",
				sizes: stock(0, 5, 0, 6, 3, 1)
			},
			{
				id: "tr1-black",
				name: "Ink",
				hex: "#1E1E1C",
				sizes: stock(0, 4, 6, 5, 2, 0)
			}
		],
		care: [
			"Machine wash cold",
			"Hang to dry",
			"Warm iron to set the pleat"
		],
		details: [
			"Made in Portugal",
			"Hem unfinished — tailor to length",
			"Model wears size M"
		],
		reviews: [
			rev(5, "Cut is excellent", "The pleat sits flat instead of pulling open, which is the whole test. Had them hemmed and they're perfect.", "Simone V.", "2026-07-24", "5'7\"–5'9\"", "M", "true"),
			rev(4, "Hem is genuinely unfinished", "Worth knowing you'll pay a tailor before you can wear them. Fit through the seat is very good.", "Andre W.", "2026-06-23", "5'10\"–6'0\"", "M", "true"),
			rev(4, "Stiff at first", "300gsm with no stretch feels rigid for a week, then relaxes into shape.", "Bea L.", "2026-06-01", "5'4\"–5'6\"", "S", "true"),
			rev(2, "Waist ran small for me", "Sizing chart said M and the M didn't fasten comfortably. Exchanged for L.", "Karl T.", "2026-05-09", "5'10\"–6'0\"", "M", "small")
		]
	},
	{
		id: "STYLE-TROU-002",
		handle: "tapered-chino",
		title: "Tapered Chino",
		category: "Trousers",
		shape: "trouser",
		price: usd(108),
		summary: "Mid-rise chino with a clean taper below the knee.",
		description: "A mid-rise chino cut straight through the thigh then tapered from the knee down, so it sits on a shoe without pooling. Garment-dyed cotton with two percent elastane for movement. Finished hem.",
		attributes: {
			fit: "Slim",
			fabric: "98% cotton, 2% elastane",
			fabricWeightGsm: 260,
			targetGender: "Men",
			features: [
				"Mid rise",
				"Tapered below knee",
				"Garment dyed",
				"Finished hem"
			]
		},
		fit: {
			modelHeightCm: 180,
			modelSizeWorn: "M",
			runsTrueToSize: "true"
		},
		sizeChartId: "chart-trousers",
		colorways: [
			{
				id: "tr2-khaki",
				name: "Khaki",
				hex: "#A89873",
				sizes: stock(4, 10, 12, 9, 5, 2)
			},
			{
				id: "tr2-navy",
				name: "Deep Navy",
				hex: "#252F45",
				sizes: stock(3, 8, 10, 8, 4, 1)
			},
			{
				id: "tr2-olive",
				name: "Faded Olive",
				hex: "#6E7355",
				sizes: stock(2, 6, 0, 6, 3, 0)
			},
			{
				id: "tr2-black",
				name: "Ink",
				hex: "#1E1E1C",
				sizes: stock(0, 5, 7, 6, 3, 1)
			}
		],
		care: [
			"Machine wash cold",
			"Tumble dry low",
			"Warm iron"
		],
		details: [
			"Made in Portugal",
			"Garment dyed for depth of colour",
			"Model wears size M"
		],
		reviews: [
			rev(5, "My default trouser now", "Bought khaki, came back for navy. The taper is judged well — slim without being skinny.", "Oscar B.", "2026-07-19", "5'10\"–6'0\"", "M", "true"),
			rev(4, "Colour deepened after washing", "Garment dye means slight variation. Mine darkened a touch and I prefer it.", "Ines F.", "2026-06-29", "5'4\"–5'6\"", "S", "true"),
			rev(4, "Good for long days", "The two percent stretch does real work. Comfortable sitting down for hours.", "Malik R.", "2026-06-07", "6'1\" or above", "L", "true"),
			rev(3, "Taper is aggressive at the ankle", "Fine on me but if you have any calf, size up or look elsewhere.", "Victor N.", "2026-05-17", "5'7\"–5'9\"", "M", "true")
		]
	}
];
function productByHandle(handle) {
	return PRODUCTS.find((p) => p.handle === handle);
}
//#endregion
//#region src/data/size-charts.ts
/**
* Shopify metaobjects: authored once, referenced by many products.
* Measurements are GARMENT laid flat, not body — the page says so
* explicitly, because conflating the two is a top return cause.
*/
var SIZE_CHARTS = [
	{
		id: "chart-tops",
		name: "Tops — garment measurements",
		rows: [
			{
				size: "XS",
				chestCm: 96,
				waistCm: 92,
				lengthCm: 66
			},
			{
				size: "S",
				chestCm: 102,
				waistCm: 98,
				lengthCm: 68
			},
			{
				size: "M",
				chestCm: 108,
				waistCm: 104,
				lengthCm: 70
			},
			{
				size: "L",
				chestCm: 114,
				waistCm: 110,
				lengthCm: 72
			},
			{
				size: "XL",
				chestCm: 122,
				waistCm: 118,
				lengthCm: 74
			},
			{
				size: "XXL",
				chestCm: 130,
				waistCm: 126,
				lengthCm: 76
			}
		],
		howToMeasure: [
			{
				part: "Chest",
				instruction: "Lay the garment flat. Measure across the body one inch below the armhole, then double it."
			},
			{
				part: "Waist",
				instruction: "Measure across the narrowest point of the body, then double it."
			},
			{
				part: "Length",
				instruction: "Measure from the highest point of the shoulder straight down to the hem."
			}
		]
	},
	{
		id: "chart-knitwear",
		name: "Knitwear — garment measurements",
		rows: [
			{
				size: "XS",
				chestCm: 100,
				waistCm: 96,
				lengthCm: 64
			},
			{
				size: "S",
				chestCm: 106,
				waistCm: 102,
				lengthCm: 66
			},
			{
				size: "M",
				chestCm: 112,
				waistCm: 108,
				lengthCm: 68
			},
			{
				size: "L",
				chestCm: 118,
				waistCm: 114,
				lengthCm: 70
			},
			{
				size: "XL",
				chestCm: 126,
				waistCm: 122,
				lengthCm: 72
			},
			{
				size: "XXL",
				chestCm: 134,
				waistCm: 130,
				lengthCm: 74
			}
		],
		howToMeasure: [
			{
				part: "Chest",
				instruction: "Lay flat without stretching the rib. Measure one inch below the armhole and double it."
			},
			{
				part: "Waist",
				instruction: "Measure across the narrowest point, unstretched, then double it."
			},
			{
				part: "Length",
				instruction: "Measure from the shoulder seam down to the bottom of the welt."
			}
		]
	},
	{
		id: "chart-trousers",
		name: "Trousers — garment measurements",
		rows: [
			{
				size: "XS",
				chestCm: 0,
				waistCm: 74,
				lengthCm: 100
			},
			{
				size: "S",
				chestCm: 0,
				waistCm: 79,
				lengthCm: 102
			},
			{
				size: "M",
				chestCm: 0,
				waistCm: 84,
				lengthCm: 104
			},
			{
				size: "L",
				chestCm: 0,
				waistCm: 90,
				lengthCm: 106
			},
			{
				size: "XL",
				chestCm: 0,
				waistCm: 97,
				lengthCm: 108
			},
			{
				size: "XXL",
				chestCm: 0,
				waistCm: 104,
				lengthCm: 110
			}
		],
		howToMeasure: [
			{
				part: "Waist",
				instruction: "Fasten the trouser and lay it flat. Measure across the top of the waistband and double it."
			},
			{
				part: "Inseam",
				instruction: "Measure from the crotch seam down the inside leg to the hem."
			},
			{
				part: "Length",
				instruction: "Measure from the top of the waistband to the hem along the outside leg."
			}
		]
	}
];
function sizeChartById(id) {
	const found = SIZE_CHARTS.find((c) => c.id === id);
	if (!found) throw new Error(`Unknown size chart: ${id}`);
	return found;
}
//#endregion
//#region src/data/shopify/client.ts
var ShopifyError = class extends Error {
	detail;
	constructor(message, detail) {
		super(message);
		this.name = "ShopifyError";
		this.detail = detail;
	}
};
async function storefront(query, variables = {}) {
	const config = shopifyConfig();
	if (!config) throw new ShopifyError("Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in .env (see .env.example).");
	const url = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
	let response;
	try {
		response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": config.token,
				Accept: "application/json"
			},
			body: JSON.stringify({
				query,
				variables
			})
		});
	} catch (cause) {
		throw new ShopifyError(`Could not reach ${config.domain}. Check SHOPIFY_STORE_DOMAIN and your network.`, cause);
	}
	if (response.status === 401 || response.status === 403) throw new ShopifyError(`Storefront API rejected the token (HTTP ${response.status}). Confirm SHOPIFY_STOREFRONT_TOKEN belongs to ${config.domain} and that the app has the unauthenticated_read_product_listings scope.`);
	if (response.status === 404) throw new ShopifyError(`No Storefront API at ${url}. Check the store domain and that SHOPIFY_API_VERSION (${config.apiVersion}) is a supported version.`);
	if (response.status === 430 || response.status === 429) throw new ShopifyError(`Rate limited by Shopify (HTTP ${response.status}). Back off and retry.`);
	if (!response.ok) throw new ShopifyError(`Storefront API returned HTTP ${response.status} ${response.statusText}.`, await response.text().catch(() => void 0));
	const body = await response.json();
	if (body.errors && body.errors.length > 0) {
		const first = body.errors[0];
		throw new ShopifyError(`Storefront API error: ${first.message}` + (first.path ? ` (at ${first.path.join(".")})` : ""), body.errors);
	}
	if (!body.data) throw new ShopifyError("Storefront API returned no data.", body);
	return body.data;
}
//#endregion
//#region src/data/shopify/identifiers.ts
/** Ours. Created by scripts/shopify-setup.mjs. */
var CUSTOM = {
	modelHeight: {
		namespace: "fit",
		key: "model_height"
	},
	modelSizeWorn: {
		namespace: "fit",
		key: "model_size_worn"
	},
	runsTrueToSize: {
		namespace: "fit",
		key: "runs_true_to_size"
	},
	summary: {
		namespace: "spec",
		key: "summary"
	},
	fitCut: {
		namespace: "spec",
		key: "fit_cut"
	},
	fabricWeightGsm: {
		namespace: "spec",
		key: "fabric_weight_gsm"
	},
	careInstructions: {
		namespace: "spec",
		key: "care_instructions"
	},
	details: {
		namespace: "spec",
		key: "details"
	},
	sizeChart: {
		namespace: "spec",
		key: "size_chart"
	},
	styleCode: {
		namespace: "spec",
		key: "style_code"
	}
};
/** Shopify's. VERIFY with `npm run shopify:doctor` before trusting. */
var CATEGORY = {
	neckline: {
		namespace: "shopify",
		key: "neckline"
	},
	sleeveLength: {
		namespace: "shopify",
		key: "sleeve-length-type"
	},
	topLength: {
		namespace: "shopify",
		key: "top-length-type"
	},
	fabric: {
		namespace: "shopify",
		key: "fabric"
	},
	targetGender: {
		namespace: "shopify",
		key: "target-gender"
	},
	ageGroup: {
		namespace: "shopify",
		key: "age-group"
	},
	features: {
		namespace: "shopify",
		key: "clothing-features"
	}
};
var ALL_IDENTIFIERS = [...Object.values(CUSTOM), ...Object.values(CATEGORY)];
/** Stable lookup key for a metafield in the flattened response map. */
var idKey = (id) => `${id.namespace}.${id.key}`;
//#endregion
//#region src/data/shopify/queries.ts
/**
* Fields shared by list and detail queries.
*
* `quantityAvailable` is the field the whole stock-aware filter depends on.
* It returns null unless the app has the unauthenticated_read_product_inventory
* scope — see docs/shopify-setup.md. A null here silently degrades filters, so
* scripts/shopify-doctor.mjs checks for it explicitly.
*
* Option values carry `swatch { color }`, which is what makes connecting the
* colour option to category metafield entries worthwhile: the hex comes from
* Shopify instead of being duplicated in code.
*/
var PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  options {
    name
    optionValues {
      name
      swatch { color }
    }
  }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  variants(first: 250) {
    nodes {
      id
      sku
      availableForSale
      quantityAvailable
      selectedOptions { name value }
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
    }
  }
  metafields(identifiers: [${ALL_IDENTIFIERS.map((id) => `{namespace:"${id.namespace}",key:"${id.key}"}`).join(",")}]) {
    namespace
    key
    type
    value
    reference {
      ... on Metaobject {
        id
        handle
        type
        fields {
          key
          value
          references(first: 25) {
            nodes {
              ... on Metaobject {
                id
                type
                fields { key value }
              }
            }
          }
        }
      }
    }
    references(first: 25) {
      nodes {
        ... on Metaobject {
          id
          type
          fields { key value }
        }
      }
    }
  }
`;
var PRODUCTS_QUERY = `
  query Products($first: Int!, $cursor: String) {
    products(first: $first, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;
var PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;
//#endregion
//#region src/data/schema.ts
/** Ordered for display. Never sort sizes alphabetically. */
var SIZE_ORDER = [
	"XS",
	"S",
	"M",
	"L",
	"XL",
	"XXL"
];
function inventoryFor(p, size) {
	return p.colorways.reduce((total, c) => {
		const row = c.sizes.find((s) => s.size === size);
		return total + (row ? row.inventory : 0);
	}, 0);
}
/** True only if some colorway actually has stock in that size. */
function hasStock(p, size) {
	return inventoryFor(p, size) > 0;
}
function totalInventory(p) {
	return p.colorways.reduce((t, c) => t + c.sizes.reduce((n, s) => n + s.inventory, 0), 0);
}
function averageRating(p) {
	if (p.reviews.length === 0) return 0;
	return p.reviews.reduce((t, r) => t + r.rating, 0) / p.reviews.length;
}
/** Full distribution, so 1- and 2-star counts stay visible. */
function ratingDistribution(p) {
	const dist = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0
	};
	for (const r of p.reviews) dist[r.rating] += 1;
	return dist;
}
/** Majority fit verdict from reviews — the "runs large" warning. */
function fitVerdict(p) {
	if (p.reviews.length === 0) return {
		verdict: "true",
		share: 0
	};
	const counts = {
		small: 0,
		true: 0,
		large: 0
	};
	for (const r of p.reviews) counts[r.fitFeedback] += 1;
	const entries = Object.entries(counts);
	entries.sort((a, b) => b[1] - a[1]);
	const [verdict, n] = entries[0];
	return {
		verdict,
		share: n / p.reviews.length
	};
}
//#endregion
//#region src/data/shopify/map.ts
/** Metafields come back positionally with nulls for absent ones. */
function indexMetafields(raw) {
	const map = /* @__PURE__ */ new Map();
	for (const mf of raw) if (mf) map.set(`${mf.namespace}.${mf.key}`, mf);
	return map;
}
var text = (m, id) => {
	const v = m.get(idKey(id))?.value;
	return v && v.trim().length > 0 ? v.trim() : void 0;
};
var int = (m, id) => {
	const v = text(m, id);
	if (v === void 0) return void 0;
	const n = Number.parseInt(v, 10);
	return Number.isFinite(n) ? n : void 0;
};
/** `dimension` is JSON: {"value":185.0,"unit":"centimeters"} */
function dimensionCm(m, id) {
	const v = text(m, id);
	if (!v) return void 0;
	try {
		const parsed = JSON.parse(v);
		if (typeof parsed.value !== "number") return void 0;
		switch (parsed.unit) {
			case "millimeters": return parsed.value / 10;
			case "centimeters": return parsed.value;
			case "meters": return parsed.value * 100;
			case "inches": return parsed.value * 2.54;
			case "feet": return parsed.value * 30.48;
			default: return parsed.value;
		}
	} catch {
		return;
	}
}
/** `list.single_line_text_field` is a JSON array of strings. */
function list(m, id) {
	const v = text(m, id);
	if (!v) return [];
	try {
		const parsed = JSON.parse(v);
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
}
var money = (raw) => ({
	amount: Math.round(Number.parseFloat(raw.amount) * 100),
	currency: "USD"
});
/**
* Category metafields resolve to metaobject entries, so the display name is
* on the reference rather than in `value` (which holds a gid).
*/
function categoryValue(m, id) {
	const mf = m.get(idKey(id));
	if (!mf) return void 0;
	const named = mf.reference?.fields.find((f) => f.key === "name" || f.key === "label");
	if (named?.value) return named.value.trim();
	const v = mf.value?.trim();
	if (!v || v.startsWith("gid://")) return void 0;
	return v;
}
/**
* List-valued category metafields (e.g. clothing features) resolve to a set
* of metaobject entries; the display name lives on each entry.
*/
function categoryValueList(m, id) {
	const mf = m.get(idKey(id));
	const names = (mf?.references?.nodes ?? []).map((n) => n.fields.find((f) => f.key === "name" || f.key === "label")?.value?.trim()).filter((v) => Boolean(v));
	if (names.length > 0) return names;
	const raw = mf?.value?.trim();
	if (raw && raw.startsWith("[")) try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed.map(String).filter((v) => !v.startsWith("gid://"));
	} catch {}
	return [];
}
function oneOf(value, allowed, fallback) {
	if (!value) return fallback;
	return allowed.find((a) => a.toLowerCase() === value.toLowerCase()) ?? fallback;
}
var SHAPE_BY_CATEGORY = {
	"T-shirts": "tee",
	"Shirts": "shirt",
	"Knitwear": "knit",
	"Trousers": "trouser"
};
function categoryFor(productType) {
	const t = (productType ?? "").toLowerCase();
	if (t.includes("trouser") || t.includes("pant") || t.includes("chino")) return "Trousers";
	if (t.includes("sweater") || t.includes("knit")) return "Knitwear";
	if (t.includes("shirt") && !t.includes("t-shirt") && !t.includes("tshirt")) return "Shirts";
	return "T-shirts";
}
var chartCache = /* @__PURE__ */ new Map();
function fieldValue(o, key) {
	return o.fields.find((f) => f.key === key)?.value ?? void 0;
}
/** dimension JSON on a metaobject field -> cm number */
function rowCm(o, key) {
	const v = fieldValue(o, key);
	if (!v) return 0;
	try {
		const parsed = JSON.parse(v);
		return typeof parsed.value === "number" ? parsed.value : 0;
	} catch {
		const n = Number.parseFloat(v);
		return Number.isFinite(n) ? n : 0;
	}
}
function mapSizeChart(ref) {
	const rows = (ref.fields.find((f) => f.key === "rows")?.references?.nodes ?? []).map((r) => ({
		size: oneOf(fieldValue(r, "size"), SIZE_ORDER, "M"),
		chestCm: rowCm(r, "chest_cm"),
		waistCm: rowCm(r, "waist_cm"),
		lengthCm: rowCm(r, "length_cm")
	}));
	const howToMeasure = (ref.fields.find((f) => f.key === "how_to_measure")?.references?.nodes ?? []).map((h) => ({
		part: fieldValue(h, "part") ?? "",
		instruction: fieldValue(h, "instruction") ?? ""
	}));
	rows.sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
	return {
		id: ref.id,
		name: fieldValue(ref, "name") ?? "Size guide",
		rows,
		howToMeasure
	};
}
function cachedSizeChart(id) {
	return chartCache.get(id);
}
var optionValue = (v, name) => v.selectedOptions.find((o) => o.name.toLowerCase() === name.toLowerCase())?.value;
/**
* Groups variants into colourways, each carrying real per-size inventory.
*
* `quantityAvailable` is null unless the app has the
* unauthenticated_read_product_inventory scope. Falling back to
* availableForSale keeps the page correct (in stock vs sold out) but loses
* the low-stock threshold, so the doctor script warns when it is null.
*/
function mapColorways(raw) {
	const colourOption = raw.options.find((o) => /colour|color/i.test(o.name));
	const swatchByName = /* @__PURE__ */ new Map();
	for (const ov of colourOption?.optionValues ?? []) if (ov.swatch?.color) swatchByName.set(ov.name, ov.swatch.color);
	const byColour = /* @__PURE__ */ new Map();
	for (const v of raw.variants.nodes) {
		const colour = optionValue(v, "Colour") ?? optionValue(v, "Color") ?? "Default";
		const sizeRaw = optionValue(v, "Size");
		const size = SIZE_ORDER.find((s) => s.toLowerCase() === (sizeRaw ?? "").toLowerCase());
		if (!size) continue;
		const inventory = v.quantityAvailable ?? (v.availableForSale ? 1 : 0);
		const bucket = byColour.get(colour) ?? [];
		bucket.push({
			size,
			inventory: Math.max(0, inventory),
			variantId: v.id
		});
		byColour.set(colour, bucket);
	}
	return [...byColour.entries()].map(([name, sizes]) => {
		const complete = SIZE_ORDER.map((size) => {
			const found = sizes.find((s) => s.size === size);
			return {
				size,
				inventory: found?.inventory ?? 0,
				...found?.variantId ? { variantId: found.variantId } : {}
			};
		});
		return {
			id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
			name,
			hex: swatchByName.get(name) ?? "#B4B4AE",
			sizes: complete
		};
	});
}
function mapProduct(raw) {
	const m = indexMetafields(raw.metafields);
	const sizeChartRef = m.get(idKey(CUSTOM.sizeChart))?.reference;
	let sizeChartId = "";
	if (sizeChartRef) {
		const chart = mapSizeChart(sizeChartRef);
		chartCache.set(chart.id, chart);
		sizeChartId = chart.id;
	}
	const category = categoryFor(raw.productType);
	const compareAt = raw.compareAtPriceRange?.minVariantPrice;
	const price = money(raw.priceRange.minVariantPrice);
	const compareAtMoney = compareAt ? money(compareAt) : void 0;
	return {
		id: text(m, CUSTOM.styleCode) ?? raw.id,
		platformId: raw.id,
		handle: raw.handle,
		title: raw.title,
		category,
		shape: SHAPE_BY_CATEGORY[category],
		price,
		...compareAtMoney && compareAtMoney.amount > price.amount ? { compareAtPrice: compareAtMoney } : {},
		summary: text(m, CUSTOM.summary) ?? raw.description.split(/(?<=\.)\s/)[0] ?? "",
		description: raw.description,
		attributes: {
			fit: oneOf(text(m, CUSTOM.fitCut), [
				"Slim",
				"Regular",
				"Relaxed",
				"Oversized"
			], "Regular"),
			...categoryValue(m, CATEGORY.neckline) ? { neckline: oneOf(categoryValue(m, CATEGORY.neckline), [
				"Crew",
				"V-neck",
				"Henley",
				"Polo",
				"Collared"
			], "Crew") } : {},
			...categoryValue(m, CATEGORY.sleeveLength) ? { sleeveLength: oneOf(categoryValue(m, CATEGORY.sleeveLength), [
				"Short",
				"Long",
				"Sleeveless"
			], "Short") } : {},
			fabric: categoryValue(m, CATEGORY.fabric) ?? "—",
			fabricWeightGsm: int(m, CUSTOM.fabricWeightGsm) ?? 0,
			targetGender: oneOf(categoryValue(m, CATEGORY.targetGender), [
				"Men",
				"Women",
				"Unisex"
			], "Unisex"),
			features: categoryValueList(m, CATEGORY.features)
		},
		fit: {
			modelHeightCm: dimensionCm(m, CUSTOM.modelHeight) ?? 0,
			modelSizeWorn: oneOf(text(m, CUSTOM.modelSizeWorn), SIZE_ORDER, "M"),
			runsTrueToSize: oneOf(text(m, CUSTOM.runsTrueToSize), [
				"small",
				"true",
				"large"
			], "true")
		},
		sizeChartId,
		colorways: mapColorways(raw),
		care: list(m, CUSTOM.careInstructions),
		details: list(m, CUSTOM.details),
		reviews: []
	};
}
//#endregion
//#region src/data/reviews/config.ts
var OKENDO_MAPPING = {
	/**
	* Titles that mean "did this fit?". Matched case-insensitively, and the
	* first hit wins, so list the most specific first.
	*/
	fitAttributeTitles: [
		"Sizing",
		"Fit",
		"Size",
		"How did it fit?"
	],
	/**
	* Assumed bounds for a centered-range fit attribute. Values at the midpoint
	* mean true to size; below means small, above means large.
	*
	* VERIFY with okendo:doctor — a wrong scale mislabels every review.
	*/
	fitScale: {
		min: 1,
		max: 5
	},
	/**
	* How far from the midpoint counts as a real signal rather than noise,
	* as a fraction of half the range. 0.25 on a 1..5 scale means a value of
	* 3.5+ reads as "large" and 2.5- as "small".
	*/
	fitDeadZone: .25,
	/** Attribute titles carrying the reviewer's height. */
	heightAttributeTitles: ["Height", "How tall are you?"],
	/** Attribute titles carrying the size the reviewer bought. */
	sizePurchasedAttributeTitles: [
		"Size purchased",
		"Size bought",
		"Size ordered"
	]
};
//#endregion
//#region src/data/reviews/okendo.ts
var BASE = "https://api.okendo.io/v1/stores";
function okendoUserId() {
	const fromProcess = typeof process !== "undefined" ? process.env?.OKENDO_USER_ID : void 0;
	const fromMeta = Object.assign({
		"ASSETS_PREFIX": void 0,
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SITE": "https://vestry.example",
		"SSR": true
	}, {
		USER: "erikbonokent",
		_: "/Users/erikbonokent/Downloads/Claude Code/Parallex/storefront/node_modules/.bin/astro"
	})?.OKENDO_USER_ID;
	const id = (fromProcess ?? fromMeta ?? "").trim();
	return id.length > 0 ? id : null;
}
function isOkendoConfigured() {
	return okendoUserId() !== null;
}
var allAttributes = (r) => [...r.attributesWithRating ?? [], ...r.attributes ?? []];
function findAttribute(r, titles) {
	const attrs = allAttributes(r);
	for (const wanted of titles) {
		const hit = attrs.find((a) => (a.title ?? "").trim().toLowerCase() === wanted.toLowerCase());
		if (hit) return hit;
	}
}
function fitFromAttribute(attr) {
	if (!attr || typeof attr.value !== "number") return "true";
	const { min, max } = OKENDO_MAPPING.fitScale;
	const mid = (min + max) / 2;
	const halfRange = (max - min) / 2;
	if (halfRange <= 0) return "true";
	const offset = (attr.value - mid) / halfRange;
	if (offset <= -OKENDO_MAPPING.fitDeadZone) return "small";
	if (offset >= OKENDO_MAPPING.fitDeadZone) return "large";
	return "true";
}
function sizeFromAttribute(attr) {
	const raw = typeof attr?.value === "string" ? attr.value.trim() : void 0;
	if (!raw) return void 0;
	return SIZE_ORDER.find((s) => s.toLowerCase() === raw.toLowerCase());
}
function heightFromAttribute(attr) {
	if (!attr) return void 0;
	if (typeof attr.value === "string" && attr.value.trim()) return attr.value.trim();
	if (typeof attr.value === "number") return String(attr.value);
}
var clampRating = (n) => {
	const r = Math.round(Number(n));
	if (!Number.isFinite(r)) return 5;
	return Math.min(5, Math.max(1, r));
};
function mapOkendoReview(raw, index) {
	const fitAttr = findAttribute(raw, OKENDO_MAPPING.fitAttributeTitles);
	const heightAttr = findAttribute(raw, OKENDO_MAPPING.heightAttributeTitles);
	const sizeAttr = findAttribute(raw, OKENDO_MAPPING.sizePurchasedAttributeTitles);
	return {
		id: raw.reviewId ?? `okendo-${index}`,
		rating: clampRating(raw.rating),
		title: (raw.title ?? "").trim(),
		body: (raw.body ?? "").trim(),
		author: (raw.reviewer?.displayName ?? raw.reviewer?.name ?? "Verified buyer").trim(),
		verified: raw.isVerifiedBuyer === true,
		date: raw.dateCreated ?? (/* @__PURE__ */ new Date()).toISOString(),
		heightBand: heightFromAttribute(heightAttr) ?? "Not given",
		sizePurchased: sizeFromAttribute(sizeAttr) ?? "M",
		fitFeedback: fitFromAttribute(fitAttr)
	};
}
var cache = null;
function normaliseProductId(id) {
	if (!id) return "";
	return (id.split("/").pop() ?? id).trim();
}
async function fetchReviewsByProduct() {
	const userId = okendoUserId();
	if (!userId) return /* @__PURE__ */ new Map();
	if (cache && Date.now() - cache.at < 3e5) return cache.byProduct;
	const url = new URL(`${BASE}/${encodeURIComponent(userId)}/reviews`);
	url.searchParams.set("limit", String(100));
	url.searchParams.set("orderBy", "date desc");
	const res = await fetch(url, { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`Okendo returned HTTP ${res.status}. Check OKENDO_USER_ID — it is the Okendo store (subscriber) id, not the Shopify store name.`);
	const reviews = (await res.json()).reviews ?? [];
	const byProduct = /* @__PURE__ */ new Map();
	reviews.forEach((raw, i) => {
		const key = normaliseProductId(raw.productId);
		if (!key) return;
		const mapped = mapOkendoReview(raw, i);
		const bucket = byProduct.get(key) ?? [];
		bucket.push(mapped);
		byProduct.set(key, bucket);
	});
	cache = {
		at: Date.now(),
		byProduct
	};
	return byProduct;
}
//#endregion
//#region src/data/reviews/index.ts
/**
* Attaches reviews to products from the configured provider.
*
* Products arriving from Shopify carry `reviews: []` — the commerce API has
* no reviews to give. This is where they get filled in.
*
* On failure the products are returned unchanged with a warning rather than
* throwing: a reviews outage should degrade the page, not take down the shop.
*/
async function attachReviews(products) {
	if (!isOkendoConfigured()) return {
		products,
		provider: "sample"
	};
	try {
		const byProduct = await fetchReviewsByProduct();
		if (byProduct.size === 0) return {
			products,
			provider: "okendo",
			warning: "Okendo returned no published reviews. Reviews render empty until some exist."
		};
		return {
			products: products.map((p) => {
				const key = normaliseProductId(p.platformId ?? p.id);
				const reviews = byProduct.get(key) ?? [];
				return {
					...p,
					reviews
				};
			}),
			provider: "okendo"
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[reviews] Okendo fetch failed, rendering without reviews:\n  ${message}`);
		return {
			products: products.map((p) => ({
				...p,
				reviews: []
			})),
			provider: "okendo",
			warning: `Okendo unavailable: ${message}`
		};
	}
}
//#endregion
//#region src/data/source.ts
var sampleSource = {
	name: "sample",
	async listProducts() {
		return PRODUCTS;
	},
	async productByHandle(handle) {
		return productByHandle(handle);
	},
	async sizeChart(id) {
		try {
			return sizeChartById(id);
		} catch {
			return;
		}
	}
};
var shopifySource = {
	name: "shopify",
	async listProducts() {
		const out = [];
		let cursor = null;
		for (let page = 0; page < 20; page += 1) {
			const data = await storefront(PRODUCTS_QUERY, {
				first: 50,
				cursor
			});
			out.push(...data.products.nodes.map(mapProduct));
			if (!data.products.pageInfo.hasNextPage) break;
			cursor = data.products.pageInfo.endCursor;
		}
		return out;
	},
	async productByHandle(handle) {
		const data = await storefront(PRODUCT_BY_HANDLE_QUERY, { handle });
		return data.product ? mapProduct(data.product) : void 0;
	},
	async sizeChart(id) {
		return cachedSizeChart(id);
	}
};
function getSource() {
	return isShopifyConfigured() ? shopifySource : sampleSource;
}
/**
* Reads from Shopify, and falls back to sample data if the store is
* unreachable — with a loud server log rather than a silent swap, so a broken
* integration is visible in development instead of looking like it works.
*/
async function loadProducts() {
	const source = getSource();
	if (source.name === "sample") {
		const withReviews = await attachReviews(await source.listProducts());
		return {
			products: withReviews.products,
			source: "sample",
			reviewProvider: withReviews.provider,
			...withReviews.warning ? { warning: withReviews.warning } : {}
		};
	}
	try {
		const products = await source.listProducts();
		if (products.length === 0) {
			const fallback = await attachReviews(await sampleSource.listProducts());
			return {
				products: fallback.products,
				source: "sample",
				reviewProvider: fallback.provider,
				warning: "Shopify returned no products. Showing sample data. Run `npm run shopify:seed` to populate the dev store."
			};
		}
		const withReviews = await attachReviews(products);
		return {
			products: withReviews.products,
			source: "shopify",
			reviewProvider: withReviews.provider,
			...withReviews.warning ? { warning: withReviews.warning } : {}
		};
	} catch (error) {
		const message = error instanceof ShopifyError ? error.message : String(error);
		console.error(`[source] Shopify read failed, falling back to sample data:\n  ${message}`);
		const fallback = await attachReviews(await sampleSource.listProducts());
		return {
			products: fallback.products,
			source: "sample",
			reviewProvider: fallback.provider,
			warning: `Shopify unavailable: ${message}`
		};
	}
}
async function loadProduct(handle) {
	const source = getSource();
	if (source.name === "sample") return {
		product: await source.productByHandle(handle),
		source: "sample"
	};
	try {
		const product = await source.productByHandle(handle);
		if (product) return {
			product: (await attachReviews([product])).products[0] ?? product,
			source: "shopify"
		};
		return {
			product: await sampleSource.productByHandle(handle),
			source: "sample"
		};
	} catch (error) {
		const message = error instanceof ShopifyError ? error.message : String(error);
		console.error(`[source] Shopify read failed for "${handle}":\n  ${message}`);
		return {
			product: await sampleSource.productByHandle(handle),
			source: "sample"
		};
	}
}
async function loadSizeChart(id) {
	const chart = await getSource().sizeChart(id);
	if (chart) return chart;
	return sampleSource.sizeChart(id);
}
//#endregion
export { averageRating as a, ratingDistribution as c, isShopifyConfigured as d, SIZE_ORDER as i, totalInventory as l, loadProducts as n, fitVerdict as o, loadSizeChart as r, hasStock as s, loadProduct as t, storefront as u };
