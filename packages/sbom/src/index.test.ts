import { describe, expect, it } from "vitest";

import { generateSbom, generateSbomFile, safeGenerateSbom, sbom } from "./index.js";

const spdx = {
	spdxVersion: "SPDX-2.3",
	dataLicense: "CC0-1.0",
	SPDXID: "SPDXRef-DOCUMENT",
	name: "example-device",
	documentNamespace: "https://example.com/spdx/example-device-1",
	creationInfo: {
		created: "2026-09-12T00:00:00Z",
		creators: ["Organization: Example Inc."],
	},
	packages: [],
};
const resource = {
	contentType: "application/spdx+json",
	body: JSON.stringify(spdx),
};

describe("SBOM resource generator", () => {
	it("serves an SPDX JSON document at the RFC 9472 endpoint", () => {
		const file = generateSbomFile(resource);
		expect(file).toEqual({
			filename: "sbom",
			path: "/.well-known/sbom",
			contentType: "application/spdx+json",
			data: resource,
			body: resource.body,
		});
	});

	it("supports other text-serializable SBOM formats", () => {
		const cyclonedx = {
			contentType: "application/vnd.cyclonedx+json; charset=utf-8",
			body: '{"bomFormat":"CycloneDX","specVersion":"1.6"}',
		};
		expect(generateSbom(cyclonedx)).toEqual(cyclonedx);
	});

	it("preserves the supplied representation verbatim", () => {
		const tagValue = { contentType: "text/spdx", body: "SPDXVersion: SPDX-2.3\n" };
		expect(generateSbomFile(tagValue).body).toBe(tagValue.body);
	});

	it("supports provider instances", () => {
		expect(sbom(resource).generate()).toEqual(generateSbomFile(resource));
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateSbom({ contentType: "application/json", body: "" }).success).toBe(false);
	});

	it.each([
		["a missing content type", { body: "{}" }],
		["a malformed content type", { contentType: "json", body: "{}" }],
		["a header injection", { contentType: "application/json\r\nX-Test: true", body: "{}" }],
		["an empty body", { contentType: "application/json", body: "" }],
		["an additional property", { ...resource, encoding: "utf-8" }],
	])("rejects %s", (_name, input) => expect(() => generateSbomFile(input)).toThrow());
});
