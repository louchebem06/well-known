import { describe, expect, it } from "vitest";

import { custom, defineConfig } from "./index.js";
import type { CustomOptions } from "./index.js";

const options: CustomOptions = {
	path: "/.well-known/example.txt",
	contentType: "text/plain; charset=utf-8",
	body: "Hello, world!\n",
};

describe("custom provider", () => {
	it("preserves the text body and content type", () => {
		expect(custom(options).generate()).toEqual({
			...options,
			filename: "example.txt",
		});
	});

	it("supports nested paths, a custom name, and serialized JSON", () => {
		const body = JSON.stringify({ enabled: true });
		const provider = custom({
			path: "/.well-known/example/metadata.json",
			name: "metadata",
			contentType: "application/json",
			body,
		});
		expect(provider.name).toBe("metadata");
		expect(provider.path).toBe("/.well-known/example/metadata.json");
		expect(provider.generate()).toEqual({
			path: provider.path,
			filename: "metadata.json",
			contentType: "application/json",
			body,
		});
	});

	it("supports empty files and returns independent generated objects", () => {
		const provider = custom({ ...options, body: "" });
		provider.generate().body = "changed";
		expect(provider.generate().body).toBe("");
	});

	it("participates in duplicate path validation", () => {
		expect(() => defineConfig({ providers: [custom(options), custom(options)] })).toThrow(
			"Duplicate well-known provider path",
		);
	});

	it.each([
		"/example.txt",
		"/.well-known/",
		"/.well-known/../outside.txt",
		"/.well-known/nested/../../outside.txt",
		"/.well-known/./example.txt",
		"/.well-known/nested//example.txt",
		"/.well-known/nested/",
		"/.well-known/%2e%2e/outside.txt",
		"/.well-known/nested\\outside.txt",
		"/.well-known/example?query=1",
		"/.well-known/example#fragment",
		"/.well-known/example\0.txt",
		"/.well-known/example\n",
		"/.well-known/example\u2028",
	])("rejects unsafe path %s", (path) => {
		expect(() => custom({ ...options, path } as CustomOptions)).toThrow("Custom path");
	});

	it.each(["", "text", "text/plain\r\nX-Header: value", "text/plain\0", "text/plain; x=\u2028"])(
		"rejects invalid content type %j",
		(contentType) => {
			expect(() => custom({ ...options, contentType })).toThrow("Custom contentType");
		},
	);

	it("rejects unserialized bodies at runtime", () => {
		expect(() => custom({ ...options, body: {} } as unknown as CustomOptions)).toThrow(
			"Custom body must be a string",
		);
	});
});
