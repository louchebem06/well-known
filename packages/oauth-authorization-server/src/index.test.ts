import { describe, expect, it } from "vitest";

import {
	generateOAuthAuthorizationServer,
	generateOAuthAuthorizationServerFile,
	generateOAuthAuthorizationServerJson,
	generateOAuthAuthorizationServerPath,
	oauthAuthorizationServer,
	safeGenerateOAuthAuthorizationServer,
} from "./index.js";

const config = {
	issuer: "https://id.example.com",
	authorization_endpoint: "https://id.example.com/authorize",
	token_endpoint: "https://id.example.com/token",
	jwks_uri: "https://id.example.com/jwks.json",
	registration_endpoint: "https://id.example.com/register",
	scopes_supported: ["openid", "profile"],
	response_types_supported: ["code"],
	response_modes_supported: ["query"],
	grant_types_supported: ["authorization_code"],
	token_endpoint_auth_methods_supported: ["private_key_jwt"],
	token_endpoint_auth_signing_alg_values_supported: ["RS256"],
	service_documentation: "https://id.example.com/docs",
	ui_locales_supported: ["en", "fr-CA"],
	op_policy_uri: "https://id.example.com/policy",
	op_tos_uri: "https://id.example.com/terms",
	revocation_endpoint: "https://id.example.com/revoke",
	revocation_endpoint_auth_methods_supported: ["client_secret_basic"],
	introspection_endpoint: "https://id.example.com/introspect",
	introspection_endpoint_auth_methods_supported: ["client_secret_basic"],
	code_challenge_methods_supported: ["S256"],
	signed_metadata: "header.payload.signature",
	custom_metadata: true,
};

describe("OAuth authorization server metadata generator", () => {
	it("generates RFC 8414 metadata and preserves extensions", () => {
		const file = generateOAuthAuthorizationServerFile(config);
		expect(file).toMatchObject({
			filename: "oauth-authorization-server",
			path: "/.well-known/oauth-authorization-server",
			contentType: "application/json",
			data: config,
		});
		expect(JSON.parse(file.body)).toEqual(config);
	});

	it("supports compact JSON and provider instances", () => {
		const compact = generateOAuthAuthorizationServerJson(config, { pretty: false });
		expect(JSON.parse(compact)).toEqual(config);
		expect(compact).not.toContain("\n");
		expect(oauthAuthorizationServer(config).generate()).toEqual(
			generateOAuthAuthorizationServerFile(config),
		);
	});

	it("derives the metadata path from an issuer path", () => {
		const issuer = "https://id.example.com/tenant/acme";
		expect(generateOAuthAuthorizationServerPath(issuer)).toBe(
			"/.well-known/oauth-authorization-server/tenant/acme",
		);
		expect(oauthAuthorizationServer({ issuer, response_types_supported: ["code"] }).path).toBe(
			"/.well-known/oauth-authorization-server/tenant/acme",
		);
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateOAuthAuthorizationServer({}).success).toBe(false);
	});

	it.each([
		["HTTP issuer", { ...config, issuer: "http://id.example.com" }],
		["issuer query", { ...config, issuer: "https://id.example.com?tenant=acme" }],
		["issuer fragment", { ...config, issuer: "https://id.example.com#metadata" }],
		["trailing issuer slash", { ...config, issuer: "https://id.example.com/tenant/" }],
		["missing response types", { issuer: config.issuer }],
		["empty response types", { ...config, response_types_supported: [] }],
		["HTTP token endpoint", { ...config, token_endpoint: "http://id.example.com/token" }],
		["invalid locale", { ...config, ui_locales_supported: ["not_a_locale"] }],
		[
			"unsigned token endpoint authentication",
			{
				...config,
				token_endpoint_auth_signing_alg_values_supported: undefined,
			},
		],
		[
			"none signing algorithm",
			{ ...config, token_endpoint_auth_signing_alg_values_supported: ["none"] },
		],
	])("rejects %s", (_name, input) =>
		expect(() => generateOAuthAuthorizationServerFile(input)).toThrow(),
	);

	it("accepts metadata for a token-only authorization server", () => {
		expect(
			generateOAuthAuthorizationServer({
				issuer: config.issuer,
				response_types_supported: ["token"],
				token_endpoint: config.token_endpoint,
				grant_types_supported: ["client_credentials"],
			}),
		).toMatchObject({ grant_types_supported: ["client_credentials"] });
	});
});
