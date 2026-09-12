import { describe, expect, it } from "vitest";
import {
	generateWebAuthn,
	generateWebAuthnFile,
	generateWebAuthnJson,
	safeGenerateWebAuthn,
	webAuthn,
} from "./index.js";

const config = {
	origins: ["https://example.co.uk", "https://login.example.com:8443"],
};

describe("WebAuthn related origins generator", () => {
	it("generates indented JSON by default", () => {
		expect(generateWebAuthnJson(config)).toBe(
			'{\n\t"origins": [\n\t\t"https://example.co.uk",\n\t\t"https://login.example.com:8443"\n\t]\n}',
		);
	});

	it("supports compact JSON", () => {
		expect(generateWebAuthnJson(config, { pretty: false })).toBe(
			'{"origins":["https://example.co.uk","https://login.example.com:8443"]}',
		);
	});

	it("generates provider metadata", () => {
		expect(generateWebAuthnFile(config)).toEqual({
			filename: "webauthn",
			path: "/.well-known/webauthn",
			contentType: "application/json",
			data: config,
			body: generateWebAuthnJson(config),
		});
	});

	it("creates a configured provider", () => {
		const provider = webAuthn(config);
		expect(provider.name).toBe("webauthn");
		expect(provider.path).toBe("/.well-known/webauthn");
		expect(provider.generate()).toEqual(generateWebAuthnFile(config));
	});

	it("returns safe validation results", () => {
		expect(safeGenerateWebAuthn(config)).toMatchObject({ success: true });
		expect(safeGenerateWebAuthn({ origins: [] }).success).toBe(false);
	});

	it.each([
		["an empty list", { origins: [] }],
		["a non-HTTPS origin", { origins: ["http://example.com"] }],
		["a relative URL", { origins: ["example.com"] }],
		["a path", { origins: ["https://example.com/login"] }],
		["a query", { origins: ["https://example.com?tenant=1"] }],
		["a fragment", { origins: ["https://example.com#login"] }],
		["credentials", { origins: ["https://user:pass@example.com"] }],
		["duplicate origins", { origins: ["https://example.com", "https://example.com"] }],
		["unknown properties", { ...config, unknown: true }],
	])("rejects %s", (_name, input) => {
		expect(() => generateWebAuthn(input)).toThrow();
	});
});
