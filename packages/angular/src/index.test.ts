import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { wellKnown } from "./index.js";

describe("wellKnown", () => {
	it("serves well-known requests before Angular SSR", () => {
		const middleware = wellKnown({
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
		const end = vi.fn();
		const response = { setHeader: vi.fn(), end } as unknown as ServerResponse;
		const next = vi.fn();
		middleware({ method: "GET", url: "/.well-known/test" } as IncomingMessage, response, next);
		expect(end).toHaveBeenCalledWith("ok");
		expect(next).not.toHaveBeenCalled();
	});
});
