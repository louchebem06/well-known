import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface SbomResource {
	contentType: string;
	body: string;
}

const mediaType =
	/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+(?:\s*;\s*[A-Za-z0-9!#$&^_.+-]+=(?:[A-Za-z0-9!#$&^_.+-]+|"[^"]*"))*$/;

export const sbomSchema = z
	.object({
		contentType: z
			.string()
			.regex(mediaType, "Content type must be a syntactically valid media type."),
		body: z.string().min(1, "SBOM body cannot be empty."),
	})
	.strict();

export type SbomInput = z.input<typeof sbomSchema>;
export type SbomOutput = z.output<typeof sbomSchema>;

export interface GeneratedSbom {
	filename: "sbom";
	path: "/.well-known/sbom";
	contentType: string;
	data: SbomOutput;
	body: string;
}

export function generateSbom(input: unknown): SbomOutput {
	return sbomSchema.parse(input);
}

export function safeGenerateSbom(input: unknown) {
	return sbomSchema.safeParse(input);
}

export function generateSbomFile(input: unknown): GeneratedSbom {
	const data = generateSbom(input);
	return {
		filename: "sbom",
		path: "/.well-known/sbom",
		contentType: data.contentType,
		data,
		body: data.body,
	};
}

export const sbomProvider: WellKnownProvider<SbomInput> = {
	name: "sbom",
	path: "/.well-known/sbom",
	generate: generateSbomFile,
};

export function sbom(config: SbomInput): WellKnownProviderInstance {
	return {
		name: sbomProvider.name,
		path: sbomProvider.path,
		generate: () => sbomProvider.generate(config),
	};
}
