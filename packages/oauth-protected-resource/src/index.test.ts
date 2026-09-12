import { describe, expect, it } from "vitest";

import {
	generateOAuthProtectedResource,
	generateOAuthProtectedResourceFile,
	generateOAuthProtectedResourceJson,
	generateOAuthProtectedResourcePath,
	oauthProtectedResource,
	safeGenerateOAuthProtectedResource,
} from "./index.js";

const config = {
	resource: "https://api.example.com",
	authorization_servers: ["https://id.example.com"],
	jwks_uri: "https://api.example.com/jwks.json",
	scopes_supported: ["read", "write"],
	bearer_methods_supported: ["header" as const],
	resource_signing_alg_values_supported: ["ES256"],
	resource_name: "Example API",
	resource_documentation: "https://api.example.com/docs",
	resource_policy_uri: "https://api.example.com/policy",
	resource_tos_uri: "https://api.example.com/terms",
	tls_client_certificate_bound_access_tokens: false,
	authorization_details_types_supported: ["payment_initiation"],
	dpop_signing_alg_values_supported: ["ES256"],
	dpop_bound_access_tokens_required: true,
	signed_metadata: "header.payload.signature",
	custom_metadata: true,
};

describe("OAuth protected resource metadata generator", () => {
	it("generates RFC 9728 metadata and preserves extensions", () => {
		const file = generateOAuthProtectedResourceFile(config);
		expect(file).toMatchObject({
			filename: "oauth-protected-resource",
			path: "/.well-known/oauth-protected-resource",
			contentType: "application/json",
			data: config,
		});
		expect(JSON.parse(file.body)).toEqual(config);
	});

	it("supports compact JSON and provider instances", () => {
		const compact = generateOAuthProtectedResourceJson(config, { pretty: false });
		expect(JSON.parse(compact)).toEqual(config);
		expect(compact).not.toContain("\n");
		expect(oauthProtectedResource(config).generate()).toEqual(
			generateOAuthProtectedResourceFile(config),
		);
	});

	it("derives the metadata path from a resource path", () => {
		const resource = "https://api.example.com/public/mcp?tenant=example";
		expect(generateOAuthProtectedResourcePath(resource)).toBe(
			"/.well-known/oauth-protected-resource/public/mcp",
		);
		expect(oauthProtectedResource({ resource }).path).toBe(
			"/.well-known/oauth-protected-resource/public/mcp",
		);
	});

	it("allows an empty bearer method list", () => {
		expect(
			generateOAuthProtectedResource({
				resource: config.resource,
				bearer_methods_supported: [],
			}),
		).toEqual({ resource: config.resource, bearer_methods_supported: [] });
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateOAuthProtectedResource({}).success).toBe(false);
	});

	it.each([
		["HTTP resource", { resource: "http://api.example.com" }],
		["resource fragment", { resource: "https://api.example.com#metadata" }],
		["trailing resource slash", { resource: "https://api.example.com/mcp/" }],
		[
			"HTTP authorization server",
			{ ...config, authorization_servers: ["http://id.example.com"] },
		],
		[
			"authorization server query",
			{ ...config, authorization_servers: ["https://id.example.com?tenant=1"] },
		],
		["HTTP JWKS URI", { ...config, jwks_uri: "http://api.example.com/jwks.json" }],
		["empty scopes", { ...config, scopes_supported: [] }],
		["unsupported bearer method", { ...config, bearer_methods_supported: ["cookie"] }],
		[
			"unsigned resource response",
			{ ...config, resource_signing_alg_values_supported: ["none"] },
		],
	])("rejects %s", (_name, input) =>
		expect(() => generateOAuthProtectedResourceFile(input)).toThrow(),
	);
});
