import { resolve } from "node:path";

import type { Plugin } from "vite";

import { DEFAULT_CONFIG_FILE, loadWellKnownConfig } from "./config-loader.js";
import { generateWellKnownFiles } from "./generator.js";
import type { WellKnownSvelteKitOptions } from "./types.js";

export function wellKnown(options: WellKnownSvelteKitOptions = {}): Plugin {
	let root = process.cwd();

	const configFile = options.configFile ?? DEFAULT_CONFIG_FILE;

	const staticDir = options.staticDir ?? "static";

	const generate = async () => {
		const config = await loadWellKnownConfig(root, configFile);

		await generateWellKnownFiles(root, staticDir, config);
	};

	return {
		name: "@well-known/sveltekit",

		async configResolved(config) {
			root = config.root;

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
