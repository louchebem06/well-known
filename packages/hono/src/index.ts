import type { MiddlewareHandler } from "hono";
import type { WellKnownConfig } from "@well-known-js/core";
import { createWellKnownFetchHandler } from "@well-known-js/node";

export function wellKnown(config: WellKnownConfig): MiddlewareHandler {
	const handle = createWellKnownFetchHandler(config);

	return async (context, next) => {
		const response = handle(context.req.raw);

		if (response) {
			return response;
		}

		await next();
	};
}
