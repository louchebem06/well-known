import type { IncomingMessage, ServerResponse } from "node:http";
import type { WellKnownConfig } from "@well-known-js/core";
import { createWellKnownNodeHandler } from "@well-known-js/node";

export type AngularSsrNext = () => void;

export function wellKnown(config: WellKnownConfig) {
	const handle = createWellKnownNodeHandler(config);
	return (request: IncomingMessage, response: ServerResponse, next: AngularSsrNext): void => {
		if (!handle(request, response)) next();
	};
}
