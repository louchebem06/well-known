import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { WellKnownConfig } from "@well-known-js/core";

/**
 * Generate all configured .well-known files.
 */
export async function generateWellKnownFiles(
	root: string,
	outputDir: string,
	config: WellKnownConfig,
): Promise<void> {
	for (const provider of config.providers) {
		const file = provider.generate();

		const relativePath = file.path.replace(/^\/+/, "");
		const outputPath = resolve(root, outputDir, relativePath);

		await mkdir(dirname(outputPath), {
			recursive: true,
		});

		await writeFile(outputPath, file.body, "utf8");
	}
}
