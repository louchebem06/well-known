import { appleAppSiteAssociation } from "@well-known-js/apple-app-site-association";
import { assetLinks } from "@well-known-js/assetlinks";
import { defineConfig } from "@well-known-js/core";
import { openIdConfiguration } from "@well-known-js/openid-configuration";
import { oauthProtectedResource } from "@well-known-js/oauth-protected-resource";
import { passkeyEndpoints } from "@well-known-js/passkey-endpoints";
import { securityTxt } from "@well-known-js/security-txt";
import { webAuthn } from "@well-known-js/webauthn";

export default defineConfig({
	providers: [
		oauthProtectedResource({
			resource: "https://api.example.com",
			authorization_servers: ["https://id.example.com"],
			scopes_supported: ["read", "write"],
			bearer_methods_supported: ["header"],
		}),
		openIdConfiguration({
			issuer: "https://id.example.com",
			authorization_endpoint: "https://id.example.com/authorize",
			token_endpoint: "https://id.example.com/token",
			jwks_uri: "https://id.example.com/jwks",
			response_types_supported: ["code"],
			subject_types_supported: ["public"],
			id_token_signing_alg_values_supported: ["RS256"],
		}),
		passkeyEndpoints({
			enroll: "https://example.com/account/passkeys/create",
			manage: "https://example.com/account/passkeys",
			prfUsageDetails: "https://example.com/help/passkeys",
		}),
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
