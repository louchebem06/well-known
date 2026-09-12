import { describe, expect, it } from "vitest";

import {
	agentCard,
	generateAgentCard,
	generateAgentCardFile,
	generateAgentCardJson,
	safeGenerateAgentCard,
} from "./index.js";

const config = {
	name: "Research Agent",
	description: "Finds and summarizes primary sources.",
	supportedInterfaces: [
		{
			url: "https://agent.example.com/a2a/v1",
			protocolBinding: "HTTP+JSON",
			protocolVersion: "1.0",
		},
	],
	provider: {
		url: "https://example.com",
		organization: "Example Labs",
	},
	version: "1.2.0",
	documentationUrl: "https://agent.example.com/docs",
	capabilities: {
		streaming: true,
		pushNotifications: false,
		extensions: [
			{
				uri: "https://example.com/a2a/extensions/citations/v1",
				description: "Adds source citations.",
				required: false,
				params: { style: "compact" },
			},
		],
	},
	securitySchemes: {
		oauth: {
			oauth2SecurityScheme: {
				flows: {
					authorizationCode: {
						authorizationUrl: "https://id.example.com/authorize",
						tokenUrl: "https://id.example.com/token",
						scopes: { research: "Run research tasks" },
						pkceRequired: true,
					},
				},
				oauth2MetadataUrl: "https://id.example.com/.well-known/oauth-authorization-server",
			},
		},
	},
	securityRequirements: [{ schemes: { oauth: { list: ["research"] } } }],
	defaultInputModes: ["text/plain"],
	defaultOutputModes: ["text/plain", "application/json"],
	skills: [
		{
			id: "research",
			name: "Research",
			description: "Researches a question using primary sources.",
			tags: ["research", "citations"],
			examples: ["Compare the latest browser APIs."],
		},
	],
	iconUrl: "https://agent.example.com/icon.png",
	customField: "preserved",
};

describe("Agent Card generator", () => {
	it("generates an A2A 1.0 Agent Card and preserves extensions", () => {
		const file = generateAgentCardFile(config);
		expect(file).toMatchObject({
			filename: "agent-card.json",
			path: "/.well-known/agent-card.json",
			contentType: "application/json",
			data: config,
		});
		expect(JSON.parse(file.body)).toEqual(config);
	});

	it("supports compact JSON and provider instances", () => {
		const compact = generateAgentCardJson(config, { pretty: false });
		expect(JSON.parse(compact)).toEqual(config);
		expect(compact).not.toContain("\n");
		expect(agentCard(config).generate()).toEqual(generateAgentCardFile(config));
	});

	it("supports each security scheme wrapper", () => {
		const variants = [
			{ apiKeySecurityScheme: { location: "header", name: "X-API-Key" } },
			{ httpAuthSecurityScheme: { scheme: "Bearer", bearerFormat: "JWT" } },
			{
				openIdConnectSecurityScheme: {
					openIdConnectUrl: "https://id.example.com/.well-known/openid-configuration",
				},
			},
			{ mtlsSecurityScheme: {} },
		];

		for (const [index, variant] of variants.entries()) {
			expect(
				generateAgentCard({
					...config,
					securitySchemes: { [`scheme${index}`]: variant },
					securityRequirements: [{ schemes: { [`scheme${index}`]: { list: [] } } }],
				}),
			).toBeDefined();
		}
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateAgentCard({}).success).toBe(false);
	});

	it.each([
		["missing interface", { ...config, supportedInterfaces: [] }],
		[
			"invalid protocol version",
			{
				...config,
				supportedInterfaces: [{ ...config.supportedInterfaces[0], protocolVersion: "1" }],
			},
		],
		["missing input modes", { ...config, defaultInputModes: [] }],
		[
			"HTTP OAuth endpoint",
			{
				...config,
				securitySchemes: {
					oauth: {
						oauth2SecurityScheme: {
							flows: {
								clientCredentials: {
									tokenUrl: "http://id.example.com/token",
									scopes: {},
								},
							},
						},
					},
				},
			},
		],
		[
			"multiple OAuth flows",
			{
				...config,
				securitySchemes: {
					oauth: {
						oauth2SecurityScheme: {
							flows: {
								clientCredentials: {
									tokenUrl: "https://id.example.com/token",
									scopes: {},
								},
								password: {},
							},
						},
					},
				},
			},
		],
		[
			"multiple security wrappers",
			{
				...config,
				securitySchemes: {
					mixed: { httpAuthSecurityScheme: { scheme: "Bearer" }, mtlsSecurityScheme: {} },
				},
				securityRequirements: [],
			},
		],
		[
			"undeclared security scheme",
			{ ...config, securityRequirements: [{ schemes: { missing: { list: [] } } }] },
		],
	])("rejects %s", (_name, input) => expect(() => generateAgentCardFile(input)).toThrow());
});
