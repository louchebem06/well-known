import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface DomainLinkageCredentialSubject {
	id: string;
	origin: string;
	[key: string]: unknown;
}

export interface DomainLinkageProof {
	type: string;
	proofPurpose: "assertionMethod";
	verificationMethod: string;
	created?: string;
	jws?: string;
	proofValue?: string;
	[key: string]: unknown;
}

export interface DomainLinkageCredential {
	"@context": Array<string | Record<string, unknown>>;
	issuer: string;
	issuanceDate: string;
	expirationDate: string;
	type: string[];
	credentialSubject: DomainLinkageCredentialSubject;
	proof: DomainLinkageProof;
	[key: string]: unknown;
}

export interface DidConfigurationResource {
	"@context": "https://identity.foundation/.well-known/did-configuration/v1";
	linked_dids: Array<DomainLinkageCredential | string>;
}

export interface DidConfigurationJsonOptions {
	pretty?: boolean;
}

const DID_CONFIGURATION_CONTEXT =
	"https://identity.foundation/.well-known/did-configuration/v1" as const;
const VC_CONTEXT = "https://www.w3.org/2018/credentials/v1" as const;
const did = z.string().regex(/^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/, "Value must be an absolute DID.");
const didUrl = z
	.string()
	.regex(
		/^did:[a-z0-9]+:[A-Za-z0-9._:%-]+(?:[/?#][^\s]*)?$/,
		"Value must be an absolute DID URL.",
	);
const rfc3339DateTime = z.iso.datetime({ offset: true });
const jsonObject = z.record(z.string(), z.unknown());
const jwt = z
	.string()
	.regex(
		/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
		"JWT credentials must use compact JWS serialization.",
	);
const origin = z.string().refine((value) => {
	try {
		const parsed = new URL(value);
		return (
			parsed.protocol === "https:" &&
			parsed.username === "" &&
			parsed.password === "" &&
			parsed.pathname === "/" &&
			parsed.search === "" &&
			parsed.hash === ""
		);
	} catch {
		return false;
	}
}, "Origin must be an HTTPS origin without credentials, a path, query, or fragment.");

export const domainLinkageProofSchema = z
	.object({
		type: z.string().min(1),
		proofPurpose: z.literal("assertionMethod"),
		verificationMethod: didUrl,
		created: rfc3339DateTime.optional(),
		jws: z.string().min(1).optional(),
		proofValue: z.string().min(1).optional(),
	})
	.loose()
	.refine((value) => value.jws !== undefined || value.proofValue !== undefined, {
		message: "A linked data proof must contain jws or proofValue.",
	});

export const domainLinkageCredentialSchema = z
	.object({
		"@context": z
			.array(z.union([z.string().min(1), jsonObject]))
			.min(2)
			.refine((value) => value[0] === VC_CONTEXT, "The VC context must be the first entry.")
			.refine(
				(value) => value.includes(DID_CONFIGURATION_CONTEXT),
				"The DID Configuration context is required.",
			),
		issuer: did,
		issuanceDate: rfc3339DateTime,
		expirationDate: rfc3339DateTime,
		type: z
			.array(z.string().min(1))
			.min(2)
			.refine((value) => value.includes("VerifiableCredential"), {
				message: "Credential type must include VerifiableCredential.",
			})
			.refine((value) => value.includes("DomainLinkageCredential"), {
				message: "Credential type must include DomainLinkageCredential.",
			}),
		credentialSubject: z
			.object({
				id: did,
				origin,
			})
			.loose(),
		proof: domainLinkageProofSchema,
	})
	.loose()
	.superRefine((value, context) => {
		if (value.credentialSubject.id !== value.issuer) {
			context.addIssue({
				code: "custom",
				path: ["credentialSubject", "id"],
				message: "credentialSubject.id must equal issuer.",
			});
		}
		if (Date.parse(value.expirationDate) <= Date.parse(value.issuanceDate)) {
			context.addIssue({
				code: "custom",
				path: ["expirationDate"],
				message: "expirationDate must be later than issuanceDate.",
			});
		}
	});

export const didConfigurationSchema = z
	.object({
		"@context": z.literal(DID_CONFIGURATION_CONTEXT),
		linked_dids: z.array(z.union([domainLinkageCredentialSchema, jwt])),
	})
	.strict();

export type DidConfigurationInput = z.input<typeof didConfigurationSchema>;
export type DidConfigurationOutput = z.output<typeof didConfigurationSchema>;

export interface GeneratedDidConfiguration {
	filename: "did-configuration.json";
	path: "/.well-known/did-configuration.json";
	contentType: "application/json";
	data: DidConfigurationOutput;
	body: string;
}

export function generateDidConfiguration(input: unknown): DidConfigurationOutput {
	return didConfigurationSchema.parse(input);
}

export function safeGenerateDidConfiguration(input: unknown) {
	return didConfigurationSchema.safeParse(input);
}

export function generateDidConfigurationJson(
	input: unknown,
	options: DidConfigurationJsonOptions = {},
): string {
	return JSON.stringify(
		generateDidConfiguration(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generateDidConfigurationFile(
	input: unknown,
	options: DidConfigurationJsonOptions = {},
): GeneratedDidConfiguration {
	const data = generateDidConfiguration(input);
	return {
		filename: "did-configuration.json",
		path: "/.well-known/did-configuration.json",
		contentType: "application/json",
		data,
		body: generateDidConfigurationJson(data, options),
	};
}

export const didConfigurationProvider: WellKnownProvider<DidConfigurationInput> = {
	name: "did-configuration",
	path: "/.well-known/did-configuration.json",
	generate: generateDidConfigurationFile,
};

export function didConfiguration(config: DidConfigurationInput): WellKnownProviderInstance {
	return {
		name: didConfigurationProvider.name,
		path: didConfigurationProvider.path,
		generate: () => didConfigurationProvider.generate(config),
	};
}
