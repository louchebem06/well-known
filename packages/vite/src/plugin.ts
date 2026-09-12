import { resolve } from "node:path";

import type { Plugin } from "vite";

import { DEFAULT_CONFIG_FILE, loadWellKnownConfig } from "./config-loader.js";
import { generateWellKnownFiles } from "./generator.js";
import type { WellKnownViteOptions } from "./types.js";

export function wellKnown(options: WellKnownViteOptions = {}): Plugin {
	let root = process.cwd();
	let outputDir = options.outputDir;

	const configFile = options.configFile ?? DEFAULT_CONFIG_FILE;

	const generate = async () => {
		const config = await loadWellKnownConfig(root, configFile);

		await generateWellKnownFiles(root, outputDir ?? "public", config);
	};

	return {
		name: "@well-known-js/vite",

		async configResolved(config) {
			root = config.root;
			outputDir ??= config.publicDir;

			await generate();

			config.logger.info("[well-known] Files generated.");
		},

		configureServer(server) {
			const configPath = resolve(root, configFile);

			server.watcher.add(configPath);

			server.watcher.on("change", async (changedPath) => {
				if (resolve(changedPath) !== configPath) {
					return;
				}

				try {
					await generate();

					server.config.logger.info(
						"[well-known] Configuration changed. Files regenerated.",
					);
				} catch (error) {
					server.config.logger.error(
						error instanceof Error ? error.message : String(error),
					);
				}
			});
		},
	};
}
