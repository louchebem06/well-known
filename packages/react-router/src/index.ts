import type { WellKnownConfig } from "@well-known-js/core";
import { createWellKnownFetchHandler } from "@well-known-js/node";

export interface WellKnownLoaderArgs {
	request: Request;
}

export function createWellKnownLoader(config: WellKnownConfig) {
	const handle = createWellKnownFetchHandler(config);
	return ({ request }: WellKnownLoaderArgs): Response =>
		handle(request) ?? new Response(null, { status: 404 });
}
