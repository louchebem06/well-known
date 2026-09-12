import { describe, expect, it } from "vitest";
import {
	generateOpenIdConfiguration,
	generateOpenIdConfigurationFile,
	generateOpenIdConfigurationJson,
	openIdConfiguration,
	safeGenerateOpenIdConfiguration,
} from "./index.js";

const config = {
	issuer: "https://id.example.com",
	authorization_endpoint: "https://id.example.com/authorize",
	token_endpoint: "https://id.example.com/token",
	jwks_uri: "https://id.example.com/jwks",
	response_types_supported: ["code"],
	subject_types_supported: ["public"],
	id_token_signing_alg_values_supported: ["RS256"],
	custom_metadata: true,
};

describe("OpenID configuration generator", () => {
	it("generates discovery metadata and preserves extensions", () => {
		const file = generateOpenIdConfigurationFile(config);
		expect(file).toMatchObject({
			filename: "openid-configuration",
			path: "/.well-known/openid-configuration",
			contentType: "application/json",
			data: config,
		});
		expect(JSON.parse(file.body)).toEqual(config);
	});
	it("supports compact JSON and provider instances", () => {
		const compact = generateOpenIdConfigurationJson(config, { pretty: false });
		expect(JSON.parse(compact)).toEqual(config);
		expect(compact).not.toContain("\n");
		expect(openIdConfiguration(config).generate()).toEqual(
			generateOpenIdConfigurationFile(config),
		);
	});
	it("returns safe failures", () =>
		expect(safeGenerateOpenIdConfiguration({}).success).toBe(false));
	it.each([
		["HTTP issuer", { ...config, issuer: "http://id.example.com" }],
		["issuer query", { ...config, issuer: "https://id.example.com?x=1" }],
		["missing required metadata", { issuer: config.issuer }],
		["empty algorithms", { ...config, id_token_signing_alg_values_supported: [] }],
	])("rejects %s", (_name, input) => expect(() => generateOpenIdConfiguration(input)).toThrow());
});
