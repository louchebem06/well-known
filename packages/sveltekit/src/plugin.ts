import type { Plugin } from "vite";
import { wellKnown as wellKnownVite } from "@well-known/vite";
import type { WellKnownSvelteKitOptions } from "./types.js";

export function wellKnown(options: WellKnownSvelteKitOptions = {}): Plugin {
	const plugin = wellKnownVite({
		configFile: options.configFile,
		outputDir: options.staticDir ?? "static",
	});

	return {
		...plugin,
		name: "@well-known/sveltekit",
	};
}
