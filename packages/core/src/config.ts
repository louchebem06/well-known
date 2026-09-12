import type { WellKnownProviderInstance } from "./provider.js";

export interface WellKnownConfig {
	providers: WellKnownProviderInstance[];
}

export function defineConfig(config: WellKnownConfig): WellKnownConfig {
	const paths = new Set<string>();

	for (const provider of config.providers) {
		if (paths.has(provider.path)) {
			throw new Error(`Duplicate well-known provider path: ${provider.path}`);
		}

		paths.add(provider.path);
	}

	return config;
}
