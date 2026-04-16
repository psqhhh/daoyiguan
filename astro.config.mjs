import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { r2 } from "emdash/astro";
import { d1 } from "emdash/db";
import tcmInquiryPlugin from "./src/plugins/tcm-inquiry.ts";

export default defineConfig({
	output: "server",
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB" }),
			storage: r2({
				binding: "MEDIA",
				baseUrl: "/_emdash/api/media/file",
			}),
			plugins: [tcmInquiryPlugin],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-sans",
			weights: [400, 500, 600, 700, 800],
			fallbacks: ["sans-serif"],
		},
	],
	devToolbar: { enabled: false },
});
