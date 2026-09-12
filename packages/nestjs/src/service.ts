import { Inject, Injectable } from "@nestjs/common";
import type { WellKnownConfig, WellKnownGeneratedFile } from "@well-known/core";

import { WELL_KNOWN_CONFIG } from "./constants.js";

@Injectable()
export class WellKnownService {
	readonly #files = new Map<string, WellKnownGeneratedFile>();

	constructor(@Inject(WELL_KNOWN_CONFIG) config: WellKnownConfig) {
		for (const provider of config.providers) {
			const file = provider.generate();

			if (this.#files.has(file.path)) {
				throw new Error(`Duplicate well-known provider path: ${file.path}`);
			}

			this.#files.set(file.path, file);
		}
	}

	get(path: string): WellKnownGeneratedFile | undefined {
		return this.#files.get(path);
	}
}
