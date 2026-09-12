import { describe, expect, it } from "vitest";
import {
	assetLinks,
	generateAssetLinks,
	generateAssetLinksFile,
	generateAssetLinksJson,
	safeGenerateAssetLinks,
} from "./index.js";

const fingerprint = Array.from({ length: 32 }, () => "AA").join(":");
const androidConfig = {
	statements: [
		{
			relation: ["delegate_permission/common.handle_all_urls"],
			target: {
				namespace: "android_app" as const,
				package_name: "com.example.app",
				sha256_cert_fingerprints: [fingerprint],
			},
		},
	],
};

describe("Asset Links generator", () => {
	it("generates an Android application statement", () => {
		expect(generateAssetLinks(androidConfig)).toEqual(androidConfig.statements);
	});

	it("supports web targets and include statements", () => {
		const config = {
			statements: [
				{
					relation: ["delegate_permission/common.get_login_creds"],
					target: { namespace: "web", site: "https://example.com" },
				},
				{ include: "https://example.com/more-statements.json" },
			],
		};
		expect(generateAssetLinks(config)).toEqual(config.statements);
	});

	it("generates pretty JSON by default and compact JSON on request", () => {
		expect(generateAssetLinksJson(androidConfig)).toContain("\n\t");
		expect(generateAssetLinksJson(androidConfig, { pretty: false })).toBe(
			JSON.stringify(androidConfig.statements),
		);
	});

	it("generates the provider file metadata", () => {
		const file = generateAssetLinksFile(androidConfig);
		expect(file).toEqual({
			filename: "assetlinks.json",
			path: "/.well-known/assetlinks.json",
			contentType: "application/json",
			data: androidConfig.statements,
			body: JSON.stringify(androidConfig.statements, null, "\t"),
		});
	});

	it("creates a configured provider", () => {
		const provider = assetLinks(androidConfig);
		expect(provider.name).toBe("assetlinks");
		expect(provider.path).toBe("/.well-known/assetlinks.json");
		expect(provider.generate()).toEqual(generateAssetLinksFile(androidConfig));
	});

	it("returns safe validation results", () => {
		expect(safeGenerateAssetLinks(androidConfig)).toMatchObject({
			success: true,
			data: androidConfig.statements,
		});
		expect(safeGenerateAssetLinks({ statements: [] }).success).toBe(false);
		expect(safeGenerateAssetLinks({ statements: [{ include: "relative.json" }] }).success).toBe(
			false,
		);
	});

	it.each([
		["an empty statement list", { statements: [] }],
		[
			"an empty relation list",
			{
				statements: [{ ...androidConfig.statements[0], relation: [] }],
			},
		],
		[
			"an empty relation",
			{
				statements: [{ ...androidConfig.statements[0], relation: [""] }],
			},
		],
		[
			"an invalid Android package name",
			{
				statements: [
					{
						...androidConfig.statements[0],
						target: { ...androidConfig.statements[0]!.target, package_name: "invalid" },
					},
				],
			},
		],
		[
			"an empty fingerprint list",
			{
				statements: [
					{
						...androidConfig.statements[0],
						target: {
							...androidConfig.statements[0]!.target,
							sha256_cert_fingerprints: [],
						},
					},
				],
			},
		],
		[
			"an invalid fingerprint",
			{
				statements: [
					{
						...androidConfig.statements[0],
						target: {
							...androidConfig.statements[0]!.target,
							sha256_cert_fingerprints: ["AA:BB"],
						},
					},
				],
			},
		],
		[
			"an invalid web URL",
			{
				statements: [
					{
						relation: ["delegate_permission/common.handle_all_urls"],
						target: { namespace: "web", site: "ftp://example.com" },
					},
				],
			},
		],
		["an invalid include URL", { statements: [{ include: "relative.json" }] }],
		[
			"a mixed include and target statement",
			{
				statements: [
					{
						include: "https://example.com/statements.json",
						relation: ["delegate_permission/common.handle_all_urls"],
						target: androidConfig.statements[0]!.target,
					},
				],
			},
		],
	])("rejects %s", (_name, input) => {
		expect(() => generateAssetLinks(input)).toThrow();
	});
});
