import type { IncomingMessage, ServerResponse } from "node:http";

import type { WellKnownConfig } from "@well-known-js/core";

import { WellKnownRegistry } from "./registry.js";

export type WellKnownNodeHandler = (request: IncomingMessage, response: ServerResponse) => boolean;

export function createWellKnownNodeHandler(config: WellKnownConfig): WellKnownNodeHandler {
	const registry = new WellKnownRegistry(config);

	return (request, response) => {
		if (request.method !== "GET" && request.method !== "HEAD") {
			return false;
		}

		const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
		const file = registry.get(pathname);

		if (!file) {
			return false;
		}

		response.statusCode = 200;
		response.setHeader("Content-Type", file.contentType);
		response.end(request.method === "HEAD" ? undefined : file.body);
		return true;
	};
}
