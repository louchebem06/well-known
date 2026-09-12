import { describe, expect, it } from "vitest";
import {
	validateIntegrationCoverage,
	type CoverageInput,
	type FeatureDefinition,
	type GeneratedFile,
	type ProviderInstance,
} from "./integration-coverage.js";

const readyFeature: FeatureDefinition = {
	id: "test-feature",
	package: "@well-known-js/test-feature",
	export: "testFeature",
	filename: "test.json",
	path: "/.well-known/test.json",
	contentType: "application/json",
	status: "ready",
};

function provider(overrides: Partial<GeneratedFile> = {}): ProviderInstance {
	return {
		name: readyFeature.id,
		path: readyFeature.path,
		generate: () => ({
			filename: readyFeature.filename,
			path: readyFeature.path,
			contentType: readyFeature.contentType,
			body: "{}",
			...overrides,
		}),
	};
}

function validInput(): CoverageInput {
	return {
		manifest: {
			technicalPackages: ["@well-known-js/core"],
			integrations: [
				{ id: "framework", package: "@well-known-js/framework", example: "framework" },
			],
			features: [readyFeature],
		},
		workspacePackages: new Set([
			"@well-known-js/core",
			"@well-known-js/framework",
			readyFeature.package,
		]),
		integrations: [
			{
				id: "framework",
				packageName: "framework-example",
				dependencies: new Set([readyFeature.package]),
				config: { providers: [provider()] },
			},
		],
		featureExports: new Map([[readyFeature.package, new Set([readyFeature.export])]]),
	};
}

describe("integration coverage", () => {
	it("accepts a ready feature integrated everywhere", () => {
		expect(validateIntegrationCoverage(validInput())).toMatchObject({
			hasErrors: false,
			issues: [],
			cells: [{ status: "pass" }],
		});
	});

	it("fails when the provider dependency is missing", () => {
		const input = validInput();
		input.integrations[0]!.dependencies.clear();
		const result = validateIntegrationCoverage(input);
		expect(result.hasErrors).toBe(true);
		expect(result.issues[0]?.message).toContain("missing dependency");
	});

	it("fails when the provider is missing from the configuration", () => {
		const input = validInput();
		input.integrations[0]!.config = { providers: [] };
		const result = validateIntegrationCoverage(input);
		expect(result.hasErrors).toBe(true);
		expect(result.issues[0]?.message).toContain("provider is missing");
	});

	it.each([
		["path", { path: "/.well-known/wrong" as const }, "path is"],
		["Content-Type", { contentType: "text/plain" }, "Content-Type is"],
		["JSON body", { body: "not-json" }, "body is not valid JSON"],
	])("fails for an invalid generated %s", (_name, overrides, expected) => {
		const input = validInput();
		input.integrations[0]!.config = { providers: [provider(overrides)] };
		const result = validateIntegrationCoverage(input);
		expect(result.hasErrors).toBe(true);
		expect(result.issues[0]?.message).toContain(expected);
	});

	it("fails when a workspace package is not classified", () => {
		const input = validInput();
		input.workspacePackages.add("@well-known-js/unknown");
		const result = validateIntegrationCoverage(input);
		expect(result.hasErrors).toBe(true);
		expect(result.issues.some((issue) => issue.message.includes("Unclassified"))).toBe(true);
	});

	it("reports an incomplete development feature as a warning", () => {
		const input = validInput();
		input.manifest.features = [{ ...readyFeature, status: "development" }];
		input.integrations[0]!.dependencies.clear();
		input.integrations[0]!.config = { providers: [] };
		input.featureExports.clear();
		const result = validateIntegrationCoverage(input);
		expect(result.hasErrors).toBe(false);
		expect(result.issues.every((issue) => issue.severity === "warning")).toBe(true);
		expect(result.cells[0]?.status).toBe("warning");
	});
});
