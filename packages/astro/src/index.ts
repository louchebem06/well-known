import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";
import type { WellKnownConfig } from "@well-known-js/core";
import { createJiti } from "jiti";

export interface WellKnownAstroOptions {
	configFile?: string;
}
export function wellKnown(options: WellKnownAstroOptions = {}): AstroIntegration {
	let root = process.cwd();
	let publicDir = resolve(root, "public");
	const configFile = options.configFile ?? "well-known.config.ts";
	const generate = async () => {
		const configPath = resolve(root, configFile);
		if (!existsSync(configPath))
			throw new Error(`[well-known] Configuration file not found: ${configPath}`);
		const jiti = createJiti(import.meta.url, { interopDefault: true, moduleCache: false });
		const config = await jiti.import<WellKnownConfig>(configPath, { default: true });
		if (!config || !Array.isArray(config.providers))
			throw new Error("[well-known] Invalid configuration: expected a providers array.");
		const files = config.providers.map((provider) => provider.generate());
		for (const file of files) {
			const output = resolve(publicDir, file.path.replace(/^\/+/, ""));
			await mkdir(dirname(output), { recursive: true });
			await writeFile(output, file.body, "utf8");
		}
	};
	return {
		name: "@well-known-js/astro",
		hooks: {
			"astro:config:setup": async ({ config }) => {
				root = fileURLToPath(config.root);
				publicDir = fileURLToPath(config.publicDir);
				await generate();
			},
			"astro:server:setup": ({ server }) => {
				const path = resolve(root, configFile);
				server.watcher.add(path);
				server.watcher.on("change", async (changedPath) => {
					if (resolve(changedPath) === path) await generate();
				});
			},
		},
	};
}

export default wellKnown;
