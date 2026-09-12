import { appleAppSiteAssociation } from "@well-known-js/apple-app-site-association";
import { assetLinks } from "@well-known-js/assetlinks";
import { defineConfig } from "@well-known-js/core";
import { securityTxt } from "@well-known-js/security-txt";
import { webAuthn } from "@well-known-js/webauthn";

export default defineConfig({
	providers: [
		webAuthn({
			origins: ["https://example.co.uk", "https://login.example.com"],
		}),
		securityTxt({
			contacts: ["mailto:security@example.com"],
			expires: "2099-12-31T23:59:59Z",
			canonical: ["https://example.com/.well-known/security.txt"],
			policy: ["https://example.com/security-policy"],
			preferredLanguages: ["en"],
		}),
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
