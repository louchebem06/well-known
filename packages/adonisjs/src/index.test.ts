import { describe, expect, it, vi } from "vitest";

import type { AdonisHttpContext, AdonisRouter } from "./index.js";
import { registerWellKnownRoutes } from "./index.js";

describe("registerWellKnownRoutes", () => {
	it("registers GET and HEAD routes", () => {
		const routes = new Map<string, (context: AdonisHttpContext) => unknown>();
		const router: AdonisRouter = {
			get: (path, handler) => routes.set(`GET ${path}`, handler),
			head: (path, handler) => routes.set(`HEAD ${path}`, handler),
		};
		registerWellKnownRoutes(router, {
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
		const header = vi.fn();
		const send = vi.fn();
		const context = { response: { header, send } } as unknown as AdonisHttpContext;

		routes.get("GET /.well-known/test")?.(context);
		expect(header).toHaveBeenCalledWith("Content-Type", "text/plain");
		expect(send).toHaveBeenCalledWith("ok");
		expect(routes.has("HEAD /.well-known/test")).toBe(true);
	});
});
