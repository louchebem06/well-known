import type { WellKnownConfig } from "@well-known-js/core";
import { createWellKnownFetchHandler } from "@well-known-js/node";

export function createWellKnownRouteHandlers(config: WellKnownConfig) {
	const handle = createWellKnownFetchHandler(config);
	const route = (request: Request): Response =>
		handle(request) ?? new Response(null, { status: 404 });
	return { GET: route, HEAD: route };
}
