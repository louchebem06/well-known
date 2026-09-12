import type { Middleware } from "koa";
import type { WellKnownConfig } from "@well-known/core";
import { WellKnownRegistry } from "@well-known/node";

export function wellKnown(config: WellKnownConfig): Middleware {
	const registry = new WellKnownRegistry(config);

	return async (context, next) => {
		if (context.method !== "GET" && context.method !== "HEAD") {
			await next();
			return;
		}

		const file = registry.get(context.path);
		if (!file) {
			await next();
			return;
		}

		context.type = file.contentType;
		context.body = file.body;
	};
}
