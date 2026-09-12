import { Elysia } from "elysia";
import { describe, expect, it } from "vitest";

import { wellKnown } from "./index.js";

describe("wellKnown", () => {
	it("serves configured routes", async () => {
		const app = new Elysia().use(
			wellKnown({
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
			}),
		);
		const response = await app.handle(new Request("http://localhost/.well-known/test"));
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
		expect(await response.text()).toBe("ok");
	});
});
