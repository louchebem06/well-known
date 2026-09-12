import { describe, expect, it } from "vitest";
import { createWellKnownRouteHandlers } from "./index.js";

describe("createWellKnownRouteHandlers", () => {
	it("returns SolidStart GET and HEAD handlers", async () => {
		const handlers = createWellKnownRouteHandlers({
			providers: [
				{
					name: "test",
					path: "/.well-known/test",
					generate: () => ({
						path: "/.well-known/test",
						filename: "test",
						contentType: "text/plain",
						body: "ok",
					}),
				},
			],
		});
		const get = handlers.GET(new Request("http://localhost/.well-known/test"));
		const head = handlers.HEAD(
			new Request("http://localhost/.well-known/test", { method: "HEAD" }),
		);
		expect(await get.text()).toBe("ok");
		expect(await head.text()).toBe("");
	});
});
