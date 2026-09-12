import { describe, expect, it } from "vitest";
import {
	generatePasskeyEndpoints,
	generatePasskeyEndpointsFile,
	generatePasskeyEndpointsJson,
	passkeyEndpoints,
	safeGeneratePasskeyEndpoints,
} from "./index.js";

const config = {
	enroll: "https://example.com/account/passkeys/create",
	manage: "https://example.com/account/passkeys",
	prfUsageDetails: "https://example.com/help/passkeys#encryption",
};

describe("passkey endpoints generator", () => {
	it("generates every endpoint", () => {
		expect(generatePasskeyEndpointsFile(config)).toEqual({
			filename: "passkey-endpoints",
			path: "/.well-known/passkey-endpoints",
			contentType: "application/json",
			data: config,
			body: generatePasskeyEndpointsJson(config),
		});
	});

	it("allows an empty support declaration", () => {
		expect(generatePasskeyEndpointsJson({})).toBe("{}");
	});

	it("supports compact JSON and a provider instance", () => {
		expect(generatePasskeyEndpointsJson(config, { pretty: false })).toBe(
			JSON.stringify(config),
		);
		expect(passkeyEndpoints(config).generate()).toEqual(generatePasskeyEndpointsFile(config));
	});

	it("returns safe results", () => {
		expect(safeGeneratePasskeyEndpoints(config)).toMatchObject({ success: true });
		expect(safeGeneratePasskeyEndpoints({ enroll: "http://example.com" }).success).toBe(false);
	});

	it.each([
		["HTTP", { enroll: "http://example.com/passkeys" }],
		["relative URLs", { manage: "/account/passkeys" }],
		["invalid URLs", { prfUsageDetails: "not a URL" }],
		["unknown fields", { support: "https://example.com/passkeys" }],
	])("rejects %s", (_name, input) => {
		expect(() => generatePasskeyEndpoints(input)).toThrow();
	});
});
