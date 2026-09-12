import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface OAuthProtectedResourceMetadata {
	resource: string;
	authorization_servers?: string[];
	jwks_uri?: string;
	scopes_supported?: string[];
	bearer_methods_supported?: Array<"header" | "body" | "query">;
	resource_signing_alg_values_supported?: string[];
	resource_name?: string;
	resource_documentation?: string;
	resource_policy_uri?: string;
	resource_tos_uri?: string;
	tls_client_certificate_bound_access_tokens?: boolean;
	authorization_details_types_supported?: string[];
	dpop_signing_alg_values_supported?: string[];
	dpop_bound_access_tokens_required?: boolean;
	signed_metadata?: string;
	[key: string]: unknown;
}

export interface OAuthProtectedResourceJsonOptions {
	pretty?: boolean;
}

const url = z.string().url();
const httpsUrl = url.refine((value) => new URL(value).protocol === "https:", {
	message: "URL must use HTTPS.",
});
const resourceIdentifier = httpsUrl.refine((value) => new URL(value).hash === "", {
	message: "Resource identifier must not contain a fragment.",
});
const authorizationServerIdentifier = httpsUrl.refine((value) => {
	const parsed = new URL(value);
	return parsed.search === "" && parsed.hash === "";
}, "Authorization server identifier must not contain a query or fragment.");
const nonEmptyStrings = z.array(z.string().min(1)).min(1);
const signingAlgorithms = nonEmptyStrings.refine((values) => !values.includes("none"), {
	message: 'Signing algorithm "none" is not allowed.',
});

export const oauthProtectedResourceSchema = z
	.object({
		resource: resourceIdentifier,
		authorization_servers: z.array(authorizationServerIdentifier).min(1).optional(),
		jwks_uri: httpsUrl.optional(),
		scopes_supported: nonEmptyStrings.optional(),
		bearer_methods_supported: z.array(z.enum(["header", "body", "query"])).optional(),
		resource_signing_alg_values_supported: signingAlgorithms.optional(),
		resource_name: z.string().min(1).optional(),
		resource_documentation: url.optional(),
		resource_policy_uri: url.optional(),
		resource_tos_uri: url.optional(),
		tls_client_certificate_bound_access_tokens: z.boolean().optional(),
		authorization_details_types_supported: nonEmptyStrings.optional(),
		dpop_signing_alg_values_supported: signingAlgorithms.optional(),
		dpop_bound_access_tokens_required: z.boolean().optional(),
		signed_metadata: z.string().min(1).optional(),
	})
	.loose();

export type OAuthProtectedResourceInput = z.input<typeof oauthProtectedResourceSchema>;
export type OAuthProtectedResourceOutput = z.output<typeof oauthProtectedResourceSchema>;

export type OAuthProtectedResourcePath = `/.well-known/oauth-protected-resource${string}`;

export interface GeneratedOAuthProtectedResource {
	filename: string;
	path: OAuthProtectedResourcePath;
	contentType: "application/json";
	data: OAuthProtectedResourceOutput;
	body: string;
}

export function generateOAuthProtectedResource(input: unknown): OAuthProtectedResourceOutput {
	return oauthProtectedResourceSchema.parse(input);
}

export function safeGenerateOAuthProtectedResource(input: unknown) {
	return oauthProtectedResourceSchema.safeParse(input);
}

export function generateOAuthProtectedResourcePath(resource: string): OAuthProtectedResourcePath {
	const parsed = new URL(resourceIdentifier.parse(resource));
	const resourcePath = parsed.pathname === "/" ? "" : parsed.pathname;

	if (resourcePath.endsWith("/")) {
		throw new Error("Resource path must not end with a slash.");
	}

	return `/.well-known/oauth-protected-resource${resourcePath}`;
}

export function generateOAuthProtectedResourceJson(
	input: unknown,
	options: OAuthProtectedResourceJsonOptions = {},
): string {
	return JSON.stringify(
		generateOAuthProtectedResource(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generateOAuthProtectedResourceFile(
	input: unknown,
	options: OAuthProtectedResourceJsonOptions = {},
): GeneratedOAuthProtectedResource {
	const data = generateOAuthProtectedResource(input);
	const path = generateOAuthProtectedResourcePath(data.resource);

	return {
		filename: path.slice(path.lastIndexOf("/") + 1),
		path,
		contentType: "application/json",
		data,
		body: generateOAuthProtectedResourceJson(data, options),
	};
}

export const oauthProtectedResourceProvider: WellKnownProvider<OAuthProtectedResourceInput> = {
	name: "oauth-protected-resource",
	path: "/.well-known/oauth-protected-resource",
	generate: generateOAuthProtectedResourceFile,
};

export function oauthProtectedResource(
	config: OAuthProtectedResourceInput,
): WellKnownProviderInstance {
	return {
		name: oauthProtectedResourceProvider.name,
		path: generateOAuthProtectedResourcePath(config.resource),
		generate: () => oauthProtectedResourceProvider.generate(config),
	};
}
