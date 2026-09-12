import { appleAppSiteAssociation } from "@well-known-js/apple-app-site-association";
import { assetLinks } from "@well-known-js/assetlinks";
import { defineConfig } from "@well-known-js/core";

export default defineConfig({
	providers: [
		assetLinks({
			statements: [
				{
					relation: ["delegate_permission/common.handle_all_urls"],
					target: {
						namespace: "android_app",
						package_name: "com.example.app",
						sha256_cert_fingerprints: [
							"AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA",
						],
					},
				},
			],
		}),
		appleAppSiteAssociation({
			applinks: {
				details: [{ appIDs: ["ABCDE12345.com.example.app"], components: [{ "/": "/*" }] }],
			},
		}),
	],
});
