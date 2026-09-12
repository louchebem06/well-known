import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { WellKnownConfig, WellKnownGeneratedFile } from "@well-known-js/core";

export async function generateWellKnownFiles(
	root: string,
	publicDir: string,
	config: WellKnownConfig,
): Promise<WellKnownGeneratedFile[]> {
	const files = config.providers.map((provider) => provider.generate());

	for (const file of files) {
		const relativePath = file.path.replace(/^\/+/, "");
		const outputPath = resolve(root, publicDir, relativePath);

		await mkdir(dirname(outputPath), { recursive: true });
		await writeFile(outputPath, file.body, "utf8");
	}

	return files;
}
