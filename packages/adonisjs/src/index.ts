import type { WellKnownConfig } from "@well-known-js/core";
import { WellKnownRegistry } from "@well-known-js/node";

export interface AdonisHttpContext {
	request: { method(): string; url(includeQueryString?: boolean): string };
	response: { header(name: string, value: string): unknown; send(body: string): unknown };
}

export interface AdonisRouter {
	get(path: string, handler: (context: AdonisHttpContext) => unknown): unknown;
	head(path: string, handler: (context: AdonisHttpContext) => unknown): unknown;
}

export function registerWellKnownRoutes(router: AdonisRouter, config: WellKnownConfig): void {
	const paths = new Set<string>();

	for (const provider of config.providers) {
		const file = provider.generate();
		if (paths.has(file.path)) {
			throw new Error(`Duplicate well-known provider path: ${file.path}`);
		}
		paths.add(file.path);

		const send = (context: AdonisHttpContext, body: string) => {
			context.response.header("Content-Type", file.contentType);
			return context.response.send(body);
		};

		router.get(file.path, (context) => send(context, file.body));
		router.head(file.path, (context) => send(context, ""));
	}
}

export function wellKnown(config: WellKnownConfig) {
	const registry = new WellKnownRegistry(config);
	return async (context: AdonisHttpContext, next: () => Promise<unknown>): Promise<unknown> => {
		const method = context.request.method();
		const path = context.request.url(false);
		const file = method === "GET" || method === "HEAD" ? registry.get(path) : undefined;
		if (!file) return next();
		context.response.header("Content-Type", file.contentType);
		return context.response.send(method === "HEAD" ? "" : file.body);
	};
}
