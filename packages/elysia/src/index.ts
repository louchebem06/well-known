import { Elysia } from "elysia";
import type { WellKnownConfig } from "@well-known-js/core";

export function wellKnown(config: WellKnownConfig): Elysia {
	const plugin = new Elysia({ name: "@well-known-js/elysia" });
	const paths = new Set<string>();

	for (const provider of config.providers) {
		const file = provider.generate();
		if (paths.has(file.path)) {
			throw new Error(`Duplicate well-known provider path: ${file.path}`);
		}
		paths.add(file.path);
		plugin.get(
			file.path,
			() => new Response(file.body, { headers: { "Content-Type": file.contentType } }),
		);
	}

	return plugin;
}
