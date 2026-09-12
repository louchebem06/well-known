import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface PasskeyEndpoints {
	enroll?: string;
	manage?: string;
	prfUsageDetails?: string;
}

export interface PasskeyEndpointsJsonOptions {
	pretty?: boolean;
}

const httpsUrlSchema = z
	.string()
	.url("Endpoint must be an absolute URL.")
	.refine((value) => new URL(value).protocol === "https:", "Endpoint must use HTTPS.");

export const passkeyEndpointsSchema = z
	.object({
		enroll: httpsUrlSchema.optional(),
		manage: httpsUrlSchema.optional(),
		prfUsageDetails: httpsUrlSchema.optional(),
	})
	.strict();

export type PasskeyEndpointsInput = z.input<typeof passkeyEndpointsSchema>;
export type PasskeyEndpointsOutput = z.output<typeof passkeyEndpointsSchema>;

export interface GeneratedPasskeyEndpoints {
	filename: "passkey-endpoints";
	path: "/.well-known/passkey-endpoints";
	contentType: "application/json";
	data: PasskeyEndpoints;
	body: string;
}

export function generatePasskeyEndpoints(input: unknown): PasskeyEndpoints {
	return passkeyEndpointsSchema.parse(input);
}

export function safeGeneratePasskeyEndpoints(input: unknown) {
	return passkeyEndpointsSchema.safeParse(input);
}

export function generatePasskeyEndpointsJson(
	input: unknown,
	options: PasskeyEndpointsJsonOptions = {},
): string {
	return JSON.stringify(
		generatePasskeyEndpoints(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generatePasskeyEndpointsFile(
	input: unknown,
	options: PasskeyEndpointsJsonOptions = {},
): GeneratedPasskeyEndpoints {
	const data = generatePasskeyEndpoints(input);
	return {
		filename: "passkey-endpoints",
		path: "/.well-known/passkey-endpoints",
		contentType: "application/json",
		data,
		body: generatePasskeyEndpointsJson(data, options),
	};
}

export const passkeyEndpointsProvider: WellKnownProvider<PasskeyEndpoints> = {
	name: "passkey-endpoints",
	path: "/.well-known/passkey-endpoints",
	generate: generatePasskeyEndpointsFile,
};

export function passkeyEndpoints(config: PasskeyEndpoints): WellKnownProviderInstance {
	return {
		name: passkeyEndpointsProvider.name,
		path: passkeyEndpointsProvider.path,
		generate: () => passkeyEndpointsProvider.generate(config),
	};
}
