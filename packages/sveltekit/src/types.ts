export interface WellKnownSvelteKitOptions {
	/**
	 * Path to the well-known configuration file,
	 * relative to the Vite project root.
	 *
	 * @default "well-known.config.ts"
	 */
	configFile?: string;

	/**
	 * SvelteKit static directory,
	 * relative to the Vite project root.
	 *
	 * @default "static"
	 */
	staticDir?: string;
}
