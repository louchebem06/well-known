import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface OAuthAuthorizationServerMetadata {
	issuer: string;
	response_types_supported: string[];
	authorization_endpoint?: string;
	token_endpoint?: string;
	jwks_uri?: string;
	registration_endpoint?: string;
	scopes_supported?: string[];
	response_modes_supported?: string[];
	grant_types_supported?: string[];
	token_endpoint_auth_methods_supported?: string[];
	token_endpoint_auth_signing_alg_values_supported?: string[];
	service_documentation?: string;
	ui_locales_supported?: string[];
	op_policy_uri?: string;
	op_tos_uri?: string;
	revocation_endpoint?: string;
	revocation_endpoint_auth_methods_supported?: string[];
	revocation_endpoint_auth_signing_alg_values_supported?: string[];
	introspection_endpoint?: string;
	introspection_endpoint_auth_methods_supported?: string[];
	introspection_endpoint_auth_signing_alg_values_supported?: string[];
	code_challenge_methods_supported?: string[];
	signed_metadata?: string;
	[key: string]: unknown;
}

export interface OAuthAuthorizationServerJsonOptions {
	pretty?: boolean;
}

const url = z.string().url();
const httpsUrl = url.refine((value) => new URL(value).protocol === "https:", {
	message: "URL must use HTTPS.",
});
const issuer = httpsUrl.refine((value) => {
	const parsed = new URL(value);
	return parsed.search === "" && parsed.hash === "";
}, "Issuer must not contain a query or fragment.");
const nonEmptyStrings = z.array(z.string().min(1)).min(1);
const signingAlgorithms = nonEmptyStrings.refine((values) => !values.includes("none"), {
	message: 'Signing algorithm "none" is not allowed.',
});
const locale = z.string().regex(/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/, {
	message: "Locale must be a BCP 47 language tag.",
});

function requiresSigningAlgorithms(methods: string[] | undefined): boolean {
	return (
		methods?.some((method) => method === "private_key_jwt" || method === "client_secret_jwt") ??
		false
	);
}

export const oauthAuthorizationServerSchema = z
	.object({
		issuer,
		response_types_supported: nonEmptyStrings,
		authorization_endpoint: httpsUrl.optional(),
		token_endpoint: httpsUrl.optional(),
		jwks_uri: httpsUrl.optional(),
		registration_endpoint: httpsUrl.optional(),
		scopes_supported: nonEmptyStrings.optional(),
		response_modes_supported: nonEmptyStrings.optional(),
		grant_types_supported: nonEmptyStrings.optional(),
		token_endpoint_auth_methods_supported: nonEmptyStrings.optional(),
		token_endpoint_auth_signing_alg_values_supported: signingAlgorithms.optional(),
		service_documentation: url.optional(),
		ui_locales_supported: z.array(locale).min(1).optional(),
		op_policy_uri: url.optional(),
		op_tos_uri: url.optional(),
		revocation_endpoint: httpsUrl.optional(),
		revocation_endpoint_auth_methods_supported: nonEmptyStrings.optional(),
		revocation_endpoint_auth_signing_alg_values_supported: signingAlgorithms.optional(),
		introspection_endpoint: httpsUrl.optional(),
		introspection_endpoint_auth_methods_supported: nonEmptyStrings.optional(),
		introspection_endpoint_auth_signing_alg_values_supported: signingAlgorithms.optional(),
		code_challenge_methods_supported: nonEmptyStrings.optional(),
		signed_metadata: z.string().min(1).optional(),
	})
	.loose()
	.superRefine((metadata, context) => {
		const requirements = [
			[
				metadata.token_endpoint_auth_methods_supported,
				metadata.token_endpoint_auth_signing_alg_values_supported,
				"token_endpoint_auth_signing_alg_values_supported",
			],
			[
				metadata.revocation_endpoint_auth_methods_supported,
				metadata.revocation_endpoint_auth_signing_alg_values_supported,
				"revocation_endpoint_auth_signing_alg_values_supported",
			],
			[
				metadata.introspection_endpoint_auth_methods_supported,
				metadata.introspection_endpoint_auth_signing_alg_values_supported,
				"introspection_endpoint_auth_signing_alg_values_supported",
			],
		] as const;

		for (const [methods, algorithms, field] of requirements) {
			if (requiresSigningAlgorithms(methods) && !algorithms) {
				context.addIssue({
					code: "custom",
					path: [field],
					message: `${field} is required for JWT client authentication.`,
				});
			}
		}
	});

export type OAuthAuthorizationServerInput = z.input<typeof oauthAuthorizationServerSchema>;
export type OAuthAuthorizationServerOutput = z.output<typeof oauthAuthorizationServerSchema>;
export type OAuthAuthorizationServerPath = `/.well-known/oauth-authorization-server${string}`;

export interface GeneratedOAuthAuthorizationServer {
	filename: string;
	path: OAuthAuthorizationServerPath;
	contentType: "application/json";
	data: OAuthAuthorizationServerOutput;
	body: string;
}

export function generateOAuthAuthorizationServer(input: unknown): OAuthAuthorizationServerOutput {
	return oauthAuthorizationServerSchema.parse(input);
}

export function safeGenerateOAuthAuthorizationServer(input: unknown) {
	return oauthAuthorizationServerSchema.safeParse(input);
}

export function generateOAuthAuthorizationServerPath(
	issuerIdentifier: string,
): OAuthAuthorizationServerPath {
	const parsed = new URL(issuer.parse(issuerIdentifier));
	const issuerPath = parsed.pathname === "/" ? "" : parsed.pathname;

	if (issuerPath.endsWith("/")) {
		throw new Error("Issuer path must not end with a slash.");
	}

	return `/.well-known/oauth-authorization-server${issuerPath}`;
}

export function generateOAuthAuthorizationServerJson(
	input: unknown,
	options: OAuthAuthorizationServerJsonOptions = {},
): string {
	return JSON.stringify(
		generateOAuthAuthorizationServer(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generateOAuthAuthorizationServerFile(
	input: unknown,
	options: OAuthAuthorizationServerJsonOptions = {},
): GeneratedOAuthAuthorizationServer {
	const data = generateOAuthAuthorizationServer(input);
	const path = generateOAuthAuthorizationServerPath(data.issuer);

	return {
		filename: path.slice(path.lastIndexOf("/") + 1),
		path,
		contentType: "application/json",
		data,
		body: generateOAuthAuthorizationServerJson(data, options),
	};
}

export const oauthAuthorizationServerProvider: WellKnownProvider<OAuthAuthorizationServerInput> = {
	name: "oauth-authorization-server",
	path: "/.well-known/oauth-authorization-server",
	generate: generateOAuthAuthorizationServerFile,
};

export function oauthAuthorizationServer(
	config: OAuthAuthorizationServerInput,
): WellKnownProviderInstance {
	return {
		name: oauthAuthorizationServerProvider.name,
		path: generateOAuthAuthorizationServerPath(config.issuer),
		generate: () => oauthAuthorizationServerProvider.generate(config),
	};
}
