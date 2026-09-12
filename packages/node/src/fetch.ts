import type { WellKnownConfig } from "@well-known/core";

import { WellKnownRegistry } from "./registry.js";

export type WellKnownFetchHandler = (request: Request) => Response | undefined;

export function createWellKnownFetchHandler(config: WellKnownConfig): WellKnownFetchHandler {
	const registry = new WellKnownRegistry(config);

	return (request) => {
		if (request.method !== "GET" && request.method !== "HEAD") {
			return undefined;
		}

		const file = registry.get(new URL(request.url).pathname);

		if (!file) {
			return undefined;
		}

		return new Response(request.method === "HEAD" ? null : file.body, {
			headers: { "Content-Type": file.contentType },
		});
	};
}
