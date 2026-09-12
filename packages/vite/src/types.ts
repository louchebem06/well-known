export interface WellKnownViteOptions {
	/**
	 * Path to the well-known configuration file,
	 * relative to the Vite project root.
	 *
	 * @default "well-known.config.ts"
	 */
	configFile?: string;

	/**
	 * Directory where the generated files are written,
	 * relative to the Vite project root.
	 *
	 * @default Vite's publicDir
	 */
	outputDir?: string;
}
