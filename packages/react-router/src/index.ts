import type { WellKnownConfig } from "@well-known/core";
import { createWellKnownFetchHandler } from "@well-known/node";

export interface WellKnownLoaderArgs {
	request: Request;
}

export function createWellKnownLoader(config: WellKnownConfig) {
	const handle = createWellKnownFetchHandler(config);
	return ({ request }: WellKnownLoaderArgs): Response =>
		handle(request) ?? new Response(null, { status: 404 });
}
