import Fastify from "fastify";
import { describe, expect, it } from "vitest";

import { wellKnown } from "./index.js";

describe("wellKnown", () => {
	it("serves registered files and leaves unknown paths to Fastify", async () => {
		const app = Fastify();
		await app.register(wellKnown, {
			config: {
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
			},
		});

		const response = await app.inject({ method: "GET", url: "/.well-known/test" });
		expect(response.statusCode).toBe(200);
		expect(response.headers["content-type"]).toContain("application/json");
		expect(response.body).toBe('{"ok":true}');
		expect((await app.inject({ method: "GET", url: "/.well-known/unknown" })).statusCode).toBe(
			404,
		);
	});
});
