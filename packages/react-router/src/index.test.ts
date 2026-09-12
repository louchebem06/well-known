import { describe, expect, it } from "vitest";
import { createWellKnownLoader } from "./index.js";

describe("createWellKnownLoader", () => {
	it("returns a resource route response", async () => {
		const loader = createWellKnownLoader({
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
		const response = loader({ request: new Request("http://localhost/.well-known/test") });
		expect(await response.text()).toBe("ok");
	});
});
