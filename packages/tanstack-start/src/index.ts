import type { WellKnownConfig } from "@well-known-js/core";
import { createWellKnownFetchHandler } from "@well-known-js/node";

export function createWellKnownServerHandler(config: WellKnownConfig) {
	const handle = createWellKnownFetchHandler(config);
	return (request: Request): Response => handle(request) ?? new Response(null, { status: 404 });
}
