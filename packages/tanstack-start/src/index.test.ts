import { describe, expect, it } from "vitest";
import { createWellKnownServerHandler } from "./index.js";

describe("createWellKnownServerHandler", () => {
	it("serves a configured server route", async () => {
		const handler = createWellKnownServerHandler({
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
		const response = handler(new Request("http://localhost/.well-known/test"));
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok");
	});
});
