import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface DidWebVerificationMethod {
	id: string;
	type: string;
	controller: string;
	publicKeyMultibase?: string;
	publicKeyJwk?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface DidWebService {
	id: string;
	type: string | string[];
	serviceEndpoint: string | Record<string, unknown> | Array<string | Record<string, unknown>>;
	[key: string]: unknown;
}

export interface DidWebDocument {
	"@context"?: string | Array<string | Record<string, unknown>>;
	id: string;
	controller?: string | string[];
	alsoKnownAs?: string[];
	verificationMethod?: DidWebVerificationMethod[];
	authentication?: Array<string | DidWebVerificationMethod>;
	assertionMethod?: Array<string | DidWebVerificationMethod>;
	keyAgreement?: Array<string | DidWebVerificationMethod>;
	capabilityInvocation?: Array<string | DidWebVerificationMethod>;
	capabilityDelegation?: Array<string | DidWebVerificationMethod>;
	service?: DidWebService[];
	[key: string]: unknown;
}

export interface DidWebJsonOptions {
	pretty?: boolean;
}

const did = z.string().regex(/^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/, "Value must be an absolute DID.");
const didUrl = z
	.string()
	.regex(
		/^did:[a-z0-9]+:[A-Za-z0-9._:%-]+(?:[/?#][^\s]*)?$/,
		"Value must be an absolute DID URL.",
	);
const url = z.string().refine((value) => {
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
}, "Value must be an absolute URL.");

const rootDidWeb = z.string().refine((value) => {
	if (!/^did:web:[A-Za-z0-9.-]+(?:%3A\d+)?$/i.test(value)) return false;

	const authority = value.slice("did:web:".length).replace(/%3A/i, ":");
	try {
		const parsed = new URL(`https://${authority}`);
		return (
			parsed.username === "" &&
			parsed.password === "" &&
			parsed.pathname === "/" &&
			parsed.hostname.length > 0 &&
			!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(parsed.hostname)
		);
	} catch {
		return false;
	}
}, "ID must be a root did:web identifier with a DNS hostname and an optional encoded port.");

const nonEmptyStrings = z.array(z.string().min(1)).min(1);
const jsonObject = z.record(z.string(), z.unknown());
const context = z
	.union([z.literal("https://www.w3.org/ns/did/v1"), z.literal("https://www.w3.org/ns/did/v1.1")])
	.or(
		z
			.array(z.union([z.string().min(1), jsonObject]))
			.min(1)
			.refine(
				(value) =>
					value[0] === "https://www.w3.org/ns/did/v1" ||
					value[0] === "https://www.w3.org/ns/did/v1.1",
				"The DID Core context must be the first entry.",
			),
	);

export const didWebVerificationMethodSchema = z
	.object({
		id: didUrl,
		type: z.string().min(1),
		controller: did,
		publicKeyMultibase: z.string().min(1).optional(),
		publicKeyJwk: jsonObject.optional(),
	})
	.loose();

const verificationRelationship = z.array(z.union([didUrl, didWebVerificationMethodSchema])).min(1);
const serviceEndpoint = z.union([url, jsonObject, z.array(z.union([url, jsonObject])).min(1)]);

export const didWebServiceSchema = z
	.object({
		id: url,
		type: z.union([z.string().min(1), nonEmptyStrings]),
		serviceEndpoint,
	})
	.loose();

export const didWebSchema = z
	.object({
		"@context": context.optional(),
		id: rootDidWeb,
		controller: z.union([did, z.array(did).min(1)]).optional(),
		alsoKnownAs: z.array(url).min(1).optional(),
		verificationMethod: z.array(didWebVerificationMethodSchema).min(1).optional(),
		authentication: verificationRelationship.optional(),
		assertionMethod: verificationRelationship.optional(),
		keyAgreement: verificationRelationship.optional(),
		capabilityInvocation: verificationRelationship.optional(),
		capabilityDelegation: verificationRelationship.optional(),
		service: z.array(didWebServiceSchema).min(1).optional(),
	})
	.loose();

export type DidWebInput = z.input<typeof didWebSchema>;
export type DidWebOutput = z.output<typeof didWebSchema>;

export interface GeneratedDidWeb {
	filename: "did.json";
	path: "/.well-known/did.json";
	contentType: "application/json";
	data: DidWebOutput;
	body: string;
}

export function generateDidWeb(input: unknown): DidWebOutput {
	return didWebSchema.parse(input);
}

export function safeGenerateDidWeb(input: unknown) {
	return didWebSchema.safeParse(input);
}

export function generateDidWebJson(input: unknown, options: DidWebJsonOptions = {}): string {
	return JSON.stringify(generateDidWeb(input), null, options.pretty === false ? undefined : "\t");
}

export function generateDidWebFile(
	input: unknown,
	options: DidWebJsonOptions = {},
): GeneratedDidWeb {
	const data = generateDidWeb(input);
	return {
		filename: "did.json",
		path: "/.well-known/did.json",
		contentType: "application/json",
		data,
		body: generateDidWebJson(data, options),
	};
}

export const didWebProvider: WellKnownProvider<DidWebInput> = {
	name: "did-web",
	path: "/.well-known/did.json",
	generate: generateDidWebFile,
};

export function didWeb(config: DidWebInput): WellKnownProviderInstance {
	return {
		name: didWebProvider.name,
		path: didWebProvider.path,
		generate: () => didWebProvider.generate(config),
	};
}
