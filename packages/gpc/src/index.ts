import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface GpcSupportRepresentation {
	gpc: boolean;
	lastUpdate: string;
	[key: string]: unknown;
}

export interface GpcJsonOptions {
	pretty?: boolean;
}

const rfc3339Date = z.iso.date();
const rfc3339DateTime = z.iso.datetime({ offset: true });

export const gpcSchema = z
	.object({
		gpc: z.boolean(),
		lastUpdate: z.union([rfc3339Date, rfc3339DateTime]),
	})
	.loose();

export type GpcInput = z.input<typeof gpcSchema>;
export type GpcOutput = z.output<typeof gpcSchema>;

export interface GeneratedGpc {
	filename: "gpc.json";
	path: "/.well-known/gpc.json";
	contentType: "application/json";
	data: GpcOutput;
	body: string;
}

export function generateGpc(input: unknown): GpcOutput {
	return gpcSchema.parse(input);
}

export function safeGenerateGpc(input: unknown) {
	return gpcSchema.safeParse(input);
}

export function generateGpcJson(input: unknown, options: GpcJsonOptions = {}): string {
	return JSON.stringify(generateGpc(input), null, options.pretty === false ? undefined : "\t");
}

export function generateGpcFile(input: unknown, options: GpcJsonOptions = {}): GeneratedGpc {
	const data = generateGpc(input);
	return {
		filename: "gpc.json",
		path: "/.well-known/gpc.json",
		contentType: "application/json",
		data,
		body: generateGpcJson(data, options),
	};
}

export const gpcProvider: WellKnownProvider<GpcInput> = {
	name: "gpc",
	path: "/.well-known/gpc.json",
	generate: generateGpcFile,
};

export function gpc(config: GpcInput): WellKnownProviderInstance {
	return {
		name: gpcProvider.name,
		path: gpcProvider.path,
		generate: () => gpcProvider.generate(config),
	};
}
