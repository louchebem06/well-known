import { describe, expect, it } from "vitest";

import {
	generateAppleAppSiteAssociation,
	generateAppleAppSiteAssociationFile,
	generateAppleAppSiteAssociationJson,
	safeGenerateAppleAppSiteAssociation,
} from "./generator.js";

describe("apple-app-site-association generator", () => {
	it("should generate a valid modern applinks configuration", () => {
		const result = generateAppleAppSiteAssociation({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/products/*",
							},
						],
					},
				],
			},
		});

		expect(result).toEqual({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/products/*",
							},
						],
					},
				],
			},
		});
	});

	it("should generate a valid legacy applinks configuration", () => {
		const result = generateAppleAppSiteAssociation({
			applinks: {
				apps: [],
				details: [
					{
						appID: "ABCDE12345.com.example.app",
						paths: ["/products/*", "NOT /products/private/*"],
					},
				],
			},
		});

		expect(result.applinks?.apps).toEqual([]);
		expect(result.applinks?.details).toHaveLength(1);
	});

	it("should support query parameters and fragments", () => {
		const result = generateAppleAppSiteAssociation({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/forgot-password/password-setup",
								"?": {
									token: "*",
								},
								"#": "reset",
							},
						],
					},
				],
			},
		});

		expect(result.applinks?.details).toHaveLength(1);
	});

	it("should support excluded components", () => {
		const result = generateAppleAppSiteAssociation({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/private/*",
								exclude: true,
							},
						],
					},
				],
			},
		});

		expect(result.applinks).toBeDefined();
	});

	it("should support webcredentials", () => {
		const result = generateAppleAppSiteAssociation({
			webcredentials: {
				apps: ["ABCDE12345.com.example.app"],
			},
		});

		expect(result.webcredentials?.apps).toEqual(["ABCDE12345.com.example.app"]);
	});

	it("should support appclips", () => {
		const result = generateAppleAppSiteAssociation({
			appclips: {
				apps: ["ABCDE12345.com.example.app.Clip"],
			},
		});

		expect(result.appclips?.apps).toEqual(["ABCDE12345.com.example.app.Clip"]);
	});

	it("should reject an empty root object", () => {
		expect(() => generateAppleAppSiteAssociation({})).toThrow();
	});

	it("should reject non-empty applinks.apps", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					apps: ["ABCDE12345.com.example.app"],
					details: [
						{
							appID: "ABCDE12345.com.example.app",
							paths: ["/products/*"],
						},
					],
				},
			}),
		).toThrow();
	});

	it("should reject an empty details array", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					details: [],
				},
			}),
		).toThrow();
	});

	it("should reject an empty appIDs array", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					details: [
						{
							appIDs: [],
							components: [
								{
									"/": "/products/*",
								},
							],
						},
					],
				},
			}),
		).toThrow();
	});

	it("should reject components without a matching rule", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					details: [
						{
							appIDs: ["ABCDE12345.com.example.app"],
							components: [
								{
									comment: "Invalid component",
								},
							],
						},
					],
				},
			}),
		).toThrow();
	});

	it("should reject paths without a leading slash", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					details: [
						{
							appIDs: ["ABCDE12345.com.example.app"],
							components: [
								{
									"/": "products/*",
								},
							],
						},
					],
				},
			}),
		).toThrow();
	});

	it("should reject absolute URLs as component paths", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					details: [
						{
							appIDs: ["ABCDE12345.com.example.app"],
							components: [
								{
									"/": "https://example.com/products/*",
								},
							],
						},
					],
				},
			}),
		).toThrow();
	});

	it("should reject empty query parameter objects", () => {
		expect(() =>
			generateAppleAppSiteAssociation({
				applinks: {
					details: [
						{
							appIDs: ["ABCDE12345.com.example.app"],
							components: [
								{
									"?": {},
								},
							],
						},
					],
				},
			}),
		).toThrow();
	});

	it("should return success with safe generation", () => {
		const result = safeGenerateAppleAppSiteAssociation({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/products/*",
							},
						],
					},
				],
			},
		});

		expect(result.success).toBe(true);
	});

	it("should return an error with safe generation", () => {
		const result = safeGenerateAppleAppSiteAssociation({});

		expect(result.success).toBe(false);
	});

	it("should generate JSON", () => {
		const result = generateAppleAppSiteAssociationJson({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/products/*",
							},
						],
					},
				],
			},
		});

		expect(JSON.parse(result)).toEqual({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/products/*",
							},
						],
					},
				],
			},
		});
	});

	it("should generate compact JSON", () => {
		const result = generateAppleAppSiteAssociationJson(
			{
				webcredentials: {
					apps: ["ABCDE12345.com.example.app"],
				},
			},
			{
				pretty: false,
			},
		);

		expect(result).toBe('{"webcredentials":{"apps":["ABCDE12345.com.example.app"]}}');
	});

	it("should generate file metadata", () => {
		const result = generateAppleAppSiteAssociationFile({
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
		});

		expect(result.filename).toBe("apple-app-site-association");
		expect(result.path).toBe("/.well-known/apple-app-site-association");
		expect(result.contentType).toBe("application/json");
		expect(JSON.parse(result.body)).toEqual(result.data);
	});
});
