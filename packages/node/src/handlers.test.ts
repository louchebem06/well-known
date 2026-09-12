import type { IncomingMessage, ServerResponse } from "node:http";

import type { WellKnownConfig } from "@well-known/core";
import { describe, expect, it, vi } from "vitest";

import { createWellKnownFetchHandler } from "./fetch.js";
import { createWellKnownNodeHandler } from "./http.js";

const config: WellKnownConfig = {
	providers: [
		{
			name: "test",
			path: "/.well-known/test",
			generate: () => ({
				path: "/.well-known/test",
				filename: "test",
				contentType: "application/json",
				body: '{"ok":true}',
			}),
		},
	],
};

describe("well-known handlers", () => {
	it("creates Fetch GET and HEAD responses", async () => {
		const handler = createWellKnownFetchHandler(config);
		const get = handler(new Request("https://example.com/.well-known/test"));
		const head = handler(
			new Request("https://example.com/.well-known/test", { method: "HEAD" }),
		);

		expect(get?.headers.get("Content-Type")).toBe("application/json");
		expect(await get?.text()).toBe('{"ok":true}');
		expect(await head?.text()).toBe("");
		expect(handler(new Request("https://example.com/unknown"))).toBeUndefined();
	});

	it("writes Node.js responses and reports whether a request matched", () => {
		const handler = createWellKnownNodeHandler(config);
		const setHeader = vi.fn();
		const end = vi.fn();
		const response = { setHeader, end } as unknown as ServerResponse;

		expect(
			handler(
				{ method: "GET", url: "/.well-known/test?query=1" } as IncomingMessage,
				response,
			),
		).toBe(true);
		expect(setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
		expect(end).toHaveBeenCalledWith('{"ok":true}');
		expect(
			handler({ method: "POST", url: "/.well-known/test" } as IncomingMessage, response),
		).toBe(false);
	});
});
