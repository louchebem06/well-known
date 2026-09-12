import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { WellKnownConfig } from "@well-known/core";
import { createJiti } from "jiti";

export const DEFAULT_CONFIG_FILE = "well-known.config.ts";

/**
 * Load the well-known configuration file.
 */
export async function loadWellKnownConfig(
	root: string,
	configFile = DEFAULT_CONFIG_FILE,
): Promise<WellKnownConfig> {
	const configPath = resolve(root, configFile);

	if (!existsSync(configPath)) {
		throw new Error(`[well-known] Configuration file not found: ${configPath}`);
	}

	const jiti = createJiti(import.meta.url, {
		interopDefault: true,
		moduleCache: false,
	});

	const config = await jiti.import<WellKnownConfig>(configPath, {
		default: true,
	});

	if (!config || !Array.isArray(config.providers)) {
		throw new Error("[well-known] Invalid configuration: expected a providers array.");
	}

	return config;
}
