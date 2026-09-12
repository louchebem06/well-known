export interface WellKnownNuxtOptions {
	/**
	 * Path to the well-known configuration file, relative to the Nuxt project root.
	 *
	 * @default "well-known.config.ts"
	 */
	configFile?: string;

	/**
	 * Public directory, relative to the Nuxt project root.
	 *
	 * @default Nuxt's `dir.public` option
	 */
	publicDir?: string;
}
