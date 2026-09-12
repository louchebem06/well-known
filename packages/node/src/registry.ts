import type { WellKnownConfig, WellKnownGeneratedFile } from "@well-known-js/core";

export class WellKnownRegistry {
	readonly #files = new Map<string, WellKnownGeneratedFile>();

	constructor(config: WellKnownConfig) {
		for (const provider of config.providers) {
			const file = provider.generate();

			if (this.#files.has(file.path)) {
				throw new Error(`Duplicate well-known provider path: ${file.path}`);
			}

			this.#files.set(file.path, file);
		}
	}

	get(pathname: string): WellKnownGeneratedFile | undefined {
		return this.#files.get(pathname);
	}
}
