import { resolve } from "node:path";

import { defineNuxtModule, extendRouteRules } from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";

import { DEFAULT_CONFIG_FILE, loadWellKnownConfig } from "./config-loader.js";
import { generateWellKnownFiles } from "./generator.js";
import type { WellKnownNuxtOptions } from "./types.js";

const wellKnownModule: NuxtModule<WellKnownNuxtOptions, WellKnownNuxtOptions, false> =
	defineNuxtModule<WellKnownNuxtOptions>({
		meta: {
			name: "@well-known/nuxt",
			configKey: "wellKnown",
		},
		defaults: {
			configFile: DEFAULT_CONFIG_FILE,
		},
		async setup(options, nuxt) {
			const root = nuxt.options.rootDir;
			const configFile = options.configFile ?? DEFAULT_CONFIG_FILE;
			const publicDir = options.publicDir ?? nuxt.options.dir.public;
			const configPath = resolve(root, configFile);

			const generate = async () => {
				const config = await loadWellKnownConfig(root, configFile);
				return generateWellKnownFiles(root, publicDir, config);
			};

			const files = await generate();

			for (const file of files) {
				extendRouteRules(file.path, {
					headers: {
						"Content-Type": file.contentType,
					},
				});
			}

			nuxt.hook("builder:watch", async (_event, path) => {
				if (resolve(root, path) !== configPath) {
					return;
				}

				try {
					await generate();
					console.info("[well-known] Configuration changed. Files regenerated.");
				} catch (error) {
					console.error(error instanceof Error ? error.message : String(error));
				}
			});
		},
	});

export default wellKnownModule;
