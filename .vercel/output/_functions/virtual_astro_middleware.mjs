import { t as sequence } from "./chunks/sequence_Di15ZzfY.mjs";
//#region src/middleware.ts
var CSP = [
	"default-src 'self'",
	"script-src 'none'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https:",
	"font-src 'self' data:",
	"connect-src 'self'",
	"form-action 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"upgrade-insecure-requests"
].join("; ");
var onRequest$1 = async (context, next) => {
	const response = await next();
	const headers = response.headers;
	headers.set("Content-Security-Policy", CSP);
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "DENY");
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
	headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
	return response;
};
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
//#endregion
export { onRequest };
