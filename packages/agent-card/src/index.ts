import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

const nonEmptyString = z.string().min(1);
const url = z.string().url();
const httpsUrl = url.refine((value) => new URL(value).protocol === "https:", {
	message: "URL must use HTTPS.",
});
const scopesSchema = z.record(nonEmptyString, z.string());
const securityRequirementSchema = z
	.object({
		schemes: z.record(nonEmptyString, z.object({ list: z.array(nonEmptyString) }).loose()),
	})
	.loose();

const authorizationCodeFlowSchema = z
	.object({
		authorizationUrl: httpsUrl,
		tokenUrl: httpsUrl,
		refreshUrl: httpsUrl.optional(),
		scopes: scopesSchema,
		pkceRequired: z.boolean().optional(),
	})
	.loose();
const clientCredentialsFlowSchema = z
	.object({
		tokenUrl: httpsUrl,
		refreshUrl: httpsUrl.optional(),
		scopes: scopesSchema,
	})
	.loose();
const implicitFlowSchema = z
	.object({
		authorizationUrl: httpsUrl.optional(),
		refreshUrl: httpsUrl.optional(),
		scopes: scopesSchema.optional(),
	})
	.loose();
const passwordFlowSchema = z
	.object({
		tokenUrl: httpsUrl.optional(),
		refreshUrl: httpsUrl.optional(),
		scopes: scopesSchema.optional(),
	})
	.loose();
const deviceCodeFlowSchema = z
	.object({
		deviceAuthorizationUrl: httpsUrl,
		tokenUrl: httpsUrl,
		refreshUrl: httpsUrl.optional(),
		scopes: scopesSchema,
	})
	.loose();

export const agentCardOAuthFlowsSchema = z
	.object({
		authorizationCode: authorizationCodeFlowSchema.optional(),
		clientCredentials: clientCredentialsFlowSchema.optional(),
		implicit: implicitFlowSchema.optional(),
		password: passwordFlowSchema.optional(),
		deviceCode: deviceCodeFlowSchema.optional(),
	})
	.loose()
	.superRefine((flows, context) => {
		const configured = [
			flows.authorizationCode,
			flows.clientCredentials,
			flows.implicit,
			flows.password,
			flows.deviceCode,
		].filter((flow) => flow !== undefined);
		if (configured.length !== 1) {
			context.addIssue({
				code: "custom",
				message: "OAuth flows must contain exactly one flow.",
			});
		}
	});

const apiKeySecurityScheme = z
	.object({
		description: z.string().optional(),
		location: z.enum(["query", "header", "cookie"]),
		name: nonEmptyString,
	})
	.loose();
const httpAuthSecurityScheme = z
	.object({
		description: z.string().optional(),
		scheme: nonEmptyString,
		bearerFormat: nonEmptyString.optional(),
	})
	.loose();
const oauth2SecurityScheme = z
	.object({
		description: z.string().optional(),
		flows: agentCardOAuthFlowsSchema,
		oauth2MetadataUrl: httpsUrl.optional(),
	})
	.loose();
const openIdConnectSecurityScheme = z
	.object({
		description: z.string().optional(),
		openIdConnectUrl: httpsUrl,
	})
	.loose();
const mutualTlsSecurityScheme = z.object({ description: z.string().optional() }).loose();

export const agentCardSecuritySchemeSchema = z
	.object({
		apiKeySecurityScheme: apiKeySecurityScheme.optional(),
		httpAuthSecurityScheme: httpAuthSecurityScheme.optional(),
		oauth2SecurityScheme: oauth2SecurityScheme.optional(),
		openIdConnectSecurityScheme: openIdConnectSecurityScheme.optional(),
		mtlsSecurityScheme: mutualTlsSecurityScheme.optional(),
	})
	.loose()
	.superRefine((scheme, context) => {
		const configured = [
			scheme.apiKeySecurityScheme,
			scheme.httpAuthSecurityScheme,
			scheme.oauth2SecurityScheme,
			scheme.openIdConnectSecurityScheme,
			scheme.mtlsSecurityScheme,
		].filter((value) => value !== undefined);
		if (configured.length !== 1) {
			context.addIssue({
				code: "custom",
				message: "Security scheme must contain exactly one scheme.",
			});
		}
	});

export const agentCardSchema = z
	.object({
		name: nonEmptyString,
		description: nonEmptyString,
		supportedInterfaces: z
			.array(
				z
					.object({
						url,
						protocolBinding: nonEmptyString,
						tenant: nonEmptyString.optional(),
						protocolVersion: z.string().regex(/^\d+\.\d+$/, {
							message: "Protocol version must use Major.Minor format.",
						}),
					})
					.loose(),
			)
			.min(1),
		provider: z
			.object({
				url,
				organization: nonEmptyString,
			})
			.loose()
			.optional(),
		version: nonEmptyString,
		documentationUrl: url.optional(),
		capabilities: z
			.object({
				streaming: z.boolean().optional(),
				pushNotifications: z.boolean().optional(),
				extensions: z
					.array(
						z
							.object({
								uri: url,
								description: z.string().optional(),
								required: z.boolean().optional(),
								params: z.record(z.string(), z.unknown()).optional(),
							})
							.loose(),
					)
					.optional(),
				extendedAgentCard: z.boolean().optional(),
			})
			.loose(),
		securitySchemes: z.record(nonEmptyString, agentCardSecuritySchemeSchema).optional(),
		securityRequirements: z.array(securityRequirementSchema).optional(),
		defaultInputModes: z.array(nonEmptyString).min(1),
		defaultOutputModes: z.array(nonEmptyString).min(1),
		skills: z.array(
			z
				.object({
					id: nonEmptyString,
					name: nonEmptyString,
					description: nonEmptyString,
					tags: z.array(nonEmptyString),
					examples: z.array(nonEmptyString).optional(),
					inputModes: z.array(nonEmptyString).optional(),
					outputModes: z.array(nonEmptyString).optional(),
					securityRequirements: z.array(securityRequirementSchema).optional(),
				})
				.loose(),
		),
		signatures: z
			.array(
				z
					.object({
						protected: nonEmptyString,
						signature: nonEmptyString,
						header: z.record(z.string(), z.unknown()).optional(),
					})
					.loose(),
			)
			.optional(),
		iconUrl: url.optional(),
	})
	.loose()
	.superRefine((card, context) => {
		const declaredSchemes = new Set(Object.keys(card.securitySchemes ?? {}));
		const requirements = [
			...(card.securityRequirements ?? []),
			...card.skills.flatMap((skill) => skill.securityRequirements ?? []),
		];

		for (const requirement of requirements) {
			for (const scheme of Object.keys(requirement.schemes)) {
				if (!declaredSchemes.has(scheme)) {
					context.addIssue({
						code: "custom",
						path: ["securityRequirements"],
						message: `Security requirement references undeclared scheme "${scheme}".`,
					});
				}
			}
		}
	});

export type AgentCardInput = z.input<typeof agentCardSchema>;
export type AgentCardOutput = z.output<typeof agentCardSchema>;

export interface AgentCardJsonOptions {
	pretty?: boolean;
}

export interface GeneratedAgentCard {
	filename: "agent-card.json";
	path: "/.well-known/agent-card.json";
	contentType: "application/json";
	data: AgentCardOutput;
	body: string;
}

export function generateAgentCard(input: unknown): AgentCardOutput {
	return agentCardSchema.parse(input);
}

export function safeGenerateAgentCard(input: unknown) {
	return agentCardSchema.safeParse(input);
}

export function generateAgentCardJson(input: unknown, options: AgentCardJsonOptions = {}): string {
	return JSON.stringify(
		generateAgentCard(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generateAgentCardFile(
	input: unknown,
	options: AgentCardJsonOptions = {},
): GeneratedAgentCard {
	const data = generateAgentCard(input);
	return {
		filename: "agent-card.json",
		path: "/.well-known/agent-card.json",
		contentType: "application/json",
		data,
		body: generateAgentCardJson(data, options),
	};
}

export const agentCardProvider: WellKnownProvider<AgentCardInput> = {
	name: "agent-card",
	path: "/.well-known/agent-card.json",
	generate: generateAgentCardFile,
};

export function agentCard(config: AgentCardInput): WellKnownProviderInstance {
	return {
		name: agentCardProvider.name,
		path: agentCardProvider.path,
		generate: () => agentCardProvider.generate(config),
	};
}
