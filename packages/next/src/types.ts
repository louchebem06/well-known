import type { NextConfig } from "next";

export interface WellKnownNextOptions {
	/**
	 * Path to the well-known configuration file, relative to the Next.js project root.
	 *
	 * @default "well-known.config.ts"
	 */
	configFile?: string;

	/**
	 * Next.js public directory, relative to the Next.js project root.
	 *
	 * @default "public"
	 */
	publicDir?: string;
}

export interface NextConfigContext {
	defaultConfig: NextConfig;
}

export type NextConfigFunction = (
	phase: string,
	context: NextConfigContext,
) => NextConfig | Promise<NextConfig>;

export type NextConfigInput = NextConfig | NextConfigFunction;
