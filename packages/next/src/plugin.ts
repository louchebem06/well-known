import type { WellKnownGeneratedFile } from "@well-known/core";
import type { NextConfig } from "next";

import { DEFAULT_CONFIG_FILE, loadWellKnownConfig } from "./config-loader.js";
import { generateWellKnownFiles } from "./generator.js";
import type { NextConfigContext, NextConfigInput, WellKnownNextOptions } from "./types.js";
import { watchWellKnownConfig } from "./watcher.js";

const DEVELOPMENT_PHASE = "phase-development-server";

interface WellKnownHeader {
	source: string;
	headers: Array<{ key: string; value: string }>;
}

function contentTypeHeaders(files: WellKnownGeneratedFile[]): WellKnownHeader[] {
	return files.map((file) => ({
		source: file.path,
		headers: [{ key: "Content-Type", value: file.contentType }],
	}));
}

export function withWellKnown(options: WellKnownNextOptions = {}) {
	return function wrap(
		nextConfig: NextConfigInput = {},
	): (phase: string, context: NextConfigContext) => Promise<NextConfig> {
		return async (phase, context) => {
			const root = process.cwd();
			const configFile = options.configFile ?? DEFAULT_CONFIG_FILE;
			const publicDir = options.publicDir ?? "public";
			const resolvedNextConfig =
				typeof nextConfig === "function" ? await nextConfig(phase, context) : nextConfig;

			const generate = async () => {
				const config = await loadWellKnownConfig(root, configFile);
				return generateWellKnownFiles(root, publicDir, config);
			};

			const files = await generate();

			if (phase === DEVELOPMENT_PHASE) {
				watchWellKnownConfig(root, configFile, publicDir, async () => {
					await generate();
					console.info("[well-known] Configuration changed. Files regenerated.");
				});
			}

			const existingHeaders = resolvedNextConfig.headers;

			return {
				...resolvedNextConfig,
				headers: async () => [
					...(existingHeaders ? await existingHeaders() : []),
					...contentTypeHeaders(files),
				],
			};
		};
	};
}
