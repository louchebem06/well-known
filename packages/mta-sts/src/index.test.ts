import { describe, expect, it } from "vitest";

import {
	generateMtaSts,
	generateMtaStsFile,
	generateMtaStsText,
	mtaSts,
	safeGenerateMtaSts,
} from "./index.js";

const policy = {
	version: "STSv1" as const,
	mode: "enforce" as const,
	mx: ["mail.example.com", "*.example.net"],
	maxAge: 604_800,
};

describe("MTA-STS policy generator", () => {
	it("generates an RFC 8461 policy with CRLF line endings", () => {
		const file = generateMtaStsFile(policy);
		expect(file).toMatchObject({
			filename: "mta-sts.txt",
			path: "/.well-known/mta-sts.txt",
			contentType: "text/plain; charset=utf-8",
			data: policy,
		});
		expect(file.body).toBe(
			"version: STSv1\r\nmode: enforce\r\nmx: mail.example.com\r\nmx: *.example.net\r\nmax_age: 604800\r\n",
		);
	});

	it("allows mode none without MX patterns", () => {
		expect(generateMtaSts({ version: "STSv1", mode: "none", maxAge: 0 })).toEqual({
			version: "STSv1",
			mode: "none",
			maxAge: 0,
		});
	});

	it("emits extension fields after standard fields", () => {
		expect(
			generateMtaStsText({ ...policy, extensions: { report_uri: "mailto:tls@example.com" } }),
		).toBe(
			`${generateMtaStsText(policy).slice(0, -2)}\r\nreport_uri: mailto:tls@example.com\r\n`,
		);
	});

	it("supports provider instances", () => {
		expect(mtaSts(policy).generate()).toEqual(generateMtaStsFile(policy));
	});

	it("returns safe validation failures", () => {
		expect(
			safeGenerateMtaSts({ version: "STSv1", mode: "enforce", maxAge: 3600 }).success,
		).toBe(false);
	});

	it.each([
		["an unsupported version", { ...policy, version: "STSv2" }],
		["an unsupported mode", { ...policy, mode: "monitor" }],
		["no MX in testing mode", { version: "STSv1", mode: "testing", maxAge: 3600 }],
		["a negative max age", { ...policy, maxAge: -1 }],
		["a max age above the RFC limit", { ...policy, maxAge: 31_557_601 }],
		["a fractional max age", { ...policy, maxAge: 1.5 }],
		["a Unicode MX", { ...policy, mx: ["máil.example.com"] }],
		["a partial wildcard", { ...policy, mx: ["mail*.example.com"] }],
		["a reserved extension", { ...policy, extensions: { mode: "none" } }],
		["an extension with leading whitespace", { ...policy, extensions: { note: " invalid" } }],
	])("rejects %s", (_name, input) => expect(() => generateMtaStsFile(input)).toThrow());
});
