import { defineConfig } from "@well-known/core";
import { appleAppSiteAssociation } from "@well-known/apple-app-site-association";

export default defineConfig({
	providers: [
		appleAppSiteAssociation({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/*",
							},
						],
					},
				],
			},
		}),
	],
});
