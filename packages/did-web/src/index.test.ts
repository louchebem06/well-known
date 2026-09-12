import { describe, expect, it } from "vitest";

import {
	didWeb,
	generateDidWeb,
	generateDidWebFile,
	generateDidWebJson,
	safeGenerateDidWeb,
} from "./index.js";

const document = {
	"@context": "https://www.w3.org/ns/did/v1" as const,
	id: "did:web:example.com",
	verificationMethod: [
		{
			id: "did:web:example.com#owner",
			type: "JsonWebKey2020",
			controller: "did:web:example.com",
			publicKeyJwk: {
				kty: "OKP",
				crv: "Ed25519",
				x: "VCpo2LMLhn6iWku8MKvSLg2ZAoC-nlOyPVQaO3FxVeQ",
			},
		},
	],
	authentication: ["did:web:example.com#owner"],
};

describe("did:web document generator", () => {
	it("generates a root did:web document", () => {
		const file = generateDidWebFile(document);
		expect(file).toMatchObject({
			filename: "did.json",
			path: "/.well-known/did.json",
			contentType: "application/json",
			data: document,
		});
		expect(JSON.parse(file.body)).toEqual(document);
	});

	it("supports encoded ports, services, and embedded verification methods", () => {
		const config = {
			"@context": [
				"https://www.w3.org/ns/did/v1.1",
				{ ExampleService: "https://example.com/vocab#" },
			],
			id: "did:web:example.com%3A8443",
			assertionMethod: [document.verificationMethod[0]],
			service: [
				{
					id: "did:web:example.com%3A8443#messages",
					type: ["MessagingService", "ExampleService"],
					serviceEndpoint: ["https://example.com/messages", { accept: ["didcomm/v2"] }],
				},
			],
		};
		expect(generateDidWeb(config)).toEqual(config);
	});

	it("accepts plain JSON and preserves extension properties", () => {
		const config = { id: "did:web:example.com", versionId: "42" };
		expect(generateDidWeb(config)).toEqual(config);
	});

	it("supports compact JSON and provider instances", () => {
		const compact = generateDidWebJson(document, { pretty: false });
		expect(JSON.parse(compact)).toEqual(document);
		expect(compact).not.toContain("\n");
		expect(didWeb(document).generate()).toEqual(generateDidWebFile(document));
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateDidWeb({ id: "did:web:127.0.0.1" }).success).toBe(false);
	});

	it.each([
		["a missing id", {}],
		["another DID method", { id: "did:key:z6MkExample" }],
		["an unencoded port", { id: "did:web:example.com:8443" }],
		["a path-based DID", { id: "did:web:example.com:users:alice" }],
		["an IP address", { id: "did:web:192.0.2.1" }],
		[
			"a misplaced core context",
			{
				"@context": ["https://example.com/context", "https://www.w3.org/ns/did/v1"],
				id: "did:web:example.com",
			},
		],
		[
			"a relative verification method",
			{ id: "did:web:example.com", authentication: ["#owner"] },
		],
		[
			"an incomplete verification method",
			{
				id: "did:web:example.com",
				verificationMethod: [{ id: "did:web:example.com#owner", type: "Multikey" }],
			},
		],
		[
			"an invalid service endpoint",
			{
				id: "did:web:example.com",
				service: [
					{
						id: "did:web:example.com#service",
						type: "Example",
						serviceEndpoint: "relative/path",
					},
				],
			},
		],
	])("rejects %s", (_name, input) => expect(() => generateDidWebFile(input)).toThrow());
});
