import type { WellKnownConfig } from "@well-known/core";
import { createWellKnownFetchHandler } from "@well-known/node";

export interface WellKnownRouteHandlers {
	GET(request: Request): Response;
	HEAD(request: Request): Response;
}

export function createWellKnownRouteHandlers(config: WellKnownConfig): WellKnownRouteHandlers {
	const handle = createWellKnownFetchHandler(config);
	const route = (request: Request) => handle(request) ?? new Response(null, { status: 404 });

	return {
		GET: route,
		HEAD: route,
	};
}
