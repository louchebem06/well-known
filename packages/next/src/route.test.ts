import type { WellKnownConfig } from "@well-known/core";
import { describe, expect, it } from "vitest";

import { createWellKnownRouteHandlers } from "./route.js";

const config: WellKnownConfig = {
	providers: [
		{
			name: "test",
			path: "/.well-known/apple-app-site-association",
			generate: () => ({
				path: "/.well-known/apple-app-site-association",
				filename: "apple-app-site-association",
				contentType: "application/json",
				body: '{"enabled":true}',
			}),
		},
	],
};

describe("createWellKnownRouteHandlers", () => {
	it("serves GET and HEAD requests", async () => {
		const handlers = createWellKnownRouteHandlers(config);
		const url = "https://example.com/.well-known/apple-app-site-association";
		const get = handlers.GET(new Request(url));
		const head = handlers.HEAD(new Request(url, { method: "HEAD" }));

		expect(get.headers.get("Content-Type")).toBe("application/json");
		expect(await get.text()).toBe('{"enabled":true}');
		expect(await head.text()).toBe("");
	});

	it("returns 404 for unknown paths", () => {
		const handlers = createWellKnownRouteHandlers(config);

		expect(handlers.GET(new Request("https://example.com/.well-known/unknown")).status).toBe(
			404,
		);
	});
});
