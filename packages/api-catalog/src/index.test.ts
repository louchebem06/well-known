import { describe, expect, it } from "vitest";

import {
	API_CATALOG_CONTENT_TYPE,
	apiCatalog,
	generateApiCatalogFile,
	generateApiCatalogJson,
	safeGenerateApiCatalog,
} from "./index.js";

const config = {
	linkset: [
		{
			anchor: "https://developer.example.com/apis/payments",
			"service-desc": [
				{
					href: "https://developer.example.com/apis/payments/openapi.yaml",
					type: "application/yaml",
					title: "Payments OpenAPI description",
					"title*": [{ value: "Description de l’API paiements", language: "fr" }],
					version: ["2026-09"],
				},
			],
			"service-doc": [
				{
					href: "/apis/payments/docs",
					type: "text/html",
					hreflang: ["en", "fr"],
				},
			],
			status: [{ href: "https://status.example.com/payments" }],
		},
	],
};

describe("API Catalog generator", () => {
	it("generates an RFC 9727 Linkset document", () => {
		const file = generateApiCatalogFile(config);
		expect(file).toMatchObject({
			filename: "api-catalog",
			path: "/.well-known/api-catalog",
			contentType: API_CATALOG_CONTENT_TYPE,
			data: config,
		});
		expect(JSON.parse(file.body)).toEqual(config);
	});

	it("supports compact JSON and provider instances", () => {
		const compact = generateApiCatalogJson(config, { pretty: false });
		expect(JSON.parse(compact)).toEqual(config);
		expect(compact).not.toContain("\n");
		expect(apiCatalog(config).generate()).toEqual(generateApiCatalogFile(config));
	});

	it("supports bookmarks, nested catalogs, and extension relation URIs", () => {
		const input = {
			linkset: [
				{
					item: [{ href: "api/v1" }],
					"api-catalog": [{ href: "https://api.example.net/catalog" }],
					"https://example.com/relations/owner": [{ href: "" }],
				},
			],
		};
		expect(generateApiCatalogFile(input).data).toEqual(input);
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateApiCatalog({}).success).toBe(false);
	});

	it.each([
		["an empty linkset", { linkset: [] }],
		["a top-level extension", { ...config, profile: "custom" }],
		["a context without a relation", { linkset: [{ anchor: "https://example.com/api" }] }],
		[
			"an invalid anchor",
			{ linkset: [{ anchor: "not a uri with spaces", item: [{ href: "/api" }] }] },
		],
		["an invalid relation", { linkset: [{ "not a relation": [{ href: "/api" }] }] }],
		["a scalar relation", { linkset: [{ item: { href: "/api" } }] }],
		["an empty relation", { linkset: [{ item: [] }] }],
		["a target without href", { linkset: [{ item: [{ type: "application/json" }] }] }],
		["an invalid href", { linkset: [{ item: [{ href: "bad target" }] }] }],
		["a scalar hreflang", { linkset: [{ item: [{ href: "/api", hreflang: "en" }] }] }],
		["a scalar extension attribute", { linkset: [{ item: [{ href: "/api", version: "1" }] }] }],
		[
			"an invalid internationalized attribute",
			{ linkset: [{ item: [{ href: "/api", "label*": ["French"] }] }] },
		],
	])("rejects %s", (_name, input) => expect(() => generateApiCatalogFile(input)).toThrow());
});
