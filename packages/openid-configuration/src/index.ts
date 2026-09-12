import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface OpenIdConfiguration {
	issuer: string;
	authorization_endpoint: string;
	jwks_uri: string;
	response_types_supported: string[];
	subject_types_supported: string[];
	id_token_signing_alg_values_supported: string[];
	token_endpoint?: string;
	userinfo_endpoint?: string;
	scopes_supported?: string[];
	claims_supported?: string[];
	grant_types_supported?: string[];
	[key: string]: unknown;
}

export interface OpenIdConfigurationJsonOptions {
	pretty?: boolean;
}

const httpsUrl = z
	.string()
	.url()
	.refine((value) => new URL(value).protocol === "https:", "URL must use HTTPS.");
const nonEmptyStrings = z.array(z.string().min(1)).min(1);
const issuer = httpsUrl.refine((value) => {
	const url = new URL(value);
	return url.search === "" && url.hash === "";
}, "Issuer must not contain a query or fragment.");

export const openIdConfigurationSchema = z
	.object({
		issuer,
		authorization_endpoint: httpsUrl,
		jwks_uri: httpsUrl,
		response_types_supported: nonEmptyStrings,
		subject_types_supported: nonEmptyStrings,
		id_token_signing_alg_values_supported: nonEmptyStrings,
		token_endpoint: httpsUrl.optional(),
		userinfo_endpoint: httpsUrl.optional(),
		scopes_supported: nonEmptyStrings.optional(),
		claims_supported: nonEmptyStrings.optional(),
		grant_types_supported: nonEmptyStrings.optional(),
	})
	.loose();

export type OpenIdConfigurationInput = z.input<typeof openIdConfigurationSchema>;
export type OpenIdConfigurationOutput = z.output<typeof openIdConfigurationSchema>;

export interface GeneratedOpenIdConfiguration {
	filename: "openid-configuration";
	path: "/.well-known/openid-configuration";
	contentType: "application/json";
	data: OpenIdConfiguration;
	body: string;
}

export function generateOpenIdConfiguration(input: unknown): OpenIdConfiguration {
	return openIdConfigurationSchema.parse(input);
}

export function safeGenerateOpenIdConfiguration(input: unknown) {
	return openIdConfigurationSchema.safeParse(input);
}

export function generateOpenIdConfigurationJson(
	input: unknown,
	options: OpenIdConfigurationJsonOptions = {},
): string {
	return JSON.stringify(
		generateOpenIdConfiguration(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generateOpenIdConfigurationFile(
	input: unknown,
	options: OpenIdConfigurationJsonOptions = {},
): GeneratedOpenIdConfiguration {
	const data = generateOpenIdConfiguration(input);
	return {
		filename: "openid-configuration",
		path: "/.well-known/openid-configuration",
		contentType: "application/json",
		data,
		body: generateOpenIdConfigurationJson(data, options),
	};
}

export const openIdConfigurationProvider: WellKnownProvider<OpenIdConfiguration> = {
	name: "openid-configuration",
	path: "/.well-known/openid-configuration",
	generate: generateOpenIdConfigurationFile,
};

export function openIdConfiguration(config: OpenIdConfiguration): WellKnownProviderInstance {
	return {
		name: openIdConfigurationProvider.name,
		path: openIdConfigurationProvider.path,
		generate: () => openIdConfigurationProvider.generate(config),
	};
}
