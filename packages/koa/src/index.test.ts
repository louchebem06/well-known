import type { Context, Next } from "koa";
import { describe, expect, it, vi } from "vitest";

import { wellKnown } from "./index.js";

describe("wellKnown", () => {
	it("serves matching paths and delegates unknown paths", async () => {
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
		const context = { method: "GET", path: "/.well-known/test" } as Context;
		const next = vi.fn() as Next;
		await middleware(context, next);
		expect(context.type).toBe("text/plain");
		expect(context.body).toBe("ok");
		expect(next).not.toHaveBeenCalled();
	});
});
