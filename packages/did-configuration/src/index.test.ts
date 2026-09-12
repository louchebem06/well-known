import { describe, expect, it } from "vitest";

import {
	didConfiguration,
	generateDidConfiguration,
	generateDidConfigurationFile,
	generateDidConfigurationJson,
	safeGenerateDidConfiguration,
} from "./index.js";

const issuer = "did:web:example.com";
const credential = {
	"@context": [
		"https://www.w3.org/2018/credentials/v1",
		"https://identity.foundation/.well-known/did-configuration/v1",
	],
	issuer,
	issuanceDate: "2026-01-01T00:00:00Z",
	expirationDate: "2027-01-01T00:00:00Z",
	type: ["VerifiableCredential", "DomainLinkageCredential"],
	credentialSubject: { id: issuer, origin: "https://example.com" },
	proof: {
		type: "DataIntegrityProof",
		created: "2026-01-01T00:00:00Z",
		proofPurpose: "assertionMethod" as const,
		verificationMethod: "did:web:example.com#owner",
		proofValue: "zExampleProof",
	},
};
const resource = {
	"@context": "https://identity.foundation/.well-known/did-configuration/v1" as const,
	linked_dids: [credential],
};

describe("DID Configuration resource generator", () => {
	it("generates a linked data credential resource", () => {
		const file = generateDidConfigurationFile(resource);
		expect(file).toMatchObject({
			filename: "did-configuration.json",
			path: "/.well-known/did-configuration.json",
			contentType: "application/json",
			data: resource,
		});
		expect(JSON.parse(file.body)).toEqual(resource);
	});

	it("accepts compact JWT credentials and preserves their order", () => {
		const jwt = "eyJhbGciOiJFZERTQSJ9.eyJpc3MiOiJkaWQ6d2ViOmV4YW1wbGUuY29tIn0.signature";
		const config = { ...resource, linked_dids: [credential, jwt] };
		expect(generateDidConfiguration(config).linked_dids).toEqual([credential, jwt]);
	});

	it("preserves extensions inside linked data credentials", () => {
		const extended = { ...credential, evidence: { type: "DomainControl" } };
		expect(
			generateDidConfiguration({ ...resource, linked_dids: [extended] }).linked_dids[0],
		).toEqual(extended);
	});

	it("allows an empty linked_dids list", () => {
		expect(generateDidConfiguration({ ...resource, linked_dids: [] }).linked_dids).toEqual([]);
	});

	it("supports compact JSON and provider instances", () => {
		const compact = generateDidConfigurationJson(resource, { pretty: false });
		expect(JSON.parse(compact)).toEqual(resource);
		expect(compact).not.toContain("\n");
		expect(didConfiguration(resource).generate()).toEqual(
			generateDidConfigurationFile(resource),
		);
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateDidConfiguration({ linked_dids: [] }).success).toBe(false);
	});

	it.each([
		["a missing context", { linked_dids: [] }],
		["an extra root member", { ...resource, version: 1 }],
		["a malformed JWT", { ...resource, linked_dids: ["not-a-jwt"] }],
		[
			"a mismatched subject",
			{
				...resource,
				linked_dids: [
					{
						...credential,
						credentialSubject: {
							...credential.credentialSubject,
							id: "did:web:other.example",
						},
					},
				],
			},
		],
		[
			"an HTTP origin",
			{
				...resource,
				linked_dids: [
					{
						...credential,
						credentialSubject: {
							...credential.credentialSubject,
							origin: "http://example.com",
						},
					},
				],
			},
		],
		[
			"an origin with a path",
			{
				...resource,
				linked_dids: [
					{
						...credential,
						credentialSubject: {
							...credential.credentialSubject,
							origin: "https://example.com/path",
						},
					},
				],
			},
		],
		[
			"a missing credential type",
			{ ...resource, linked_dids: [{ ...credential, type: ["VerifiableCredential"] }] },
		],
		[
			"a proof with the wrong purpose",
			{
				...resource,
				linked_dids: [
					{
						...credential,
						proof: { ...credential.proof, proofPurpose: "authentication" },
					},
				],
			},
		],
		[
			"a proof without a signature",
			{
				...resource,
				linked_dids: [
					{
						...credential,
						proof: {
							type: "DataIntegrityProof",
							proofPurpose: "assertionMethod",
							verificationMethod: "did:web:example.com#owner",
						},
					},
				],
			},
		],
		[
			"an inverted validity period",
			{
				...resource,
				linked_dids: [{ ...credential, expirationDate: credential.issuanceDate }],
			},
		],
	])("rejects %s", (_name, input) => expect(() => generateDidConfigurationFile(input)).toThrow());
});
