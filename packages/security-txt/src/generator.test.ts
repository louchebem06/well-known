import { describe, expect, it } from "vitest";
import {
	generateSecurityTxt,
	generateSecurityTxtFile,
	generateSecurityTxtText,
	safeGenerateSecurityTxt,
	securityTxt,
} from "./index.js";

const config = {
	contacts: ["mailto:security@example.com", "https://example.com/security"],
	expires: "2099-12-31T23:59:59Z",
	comments: ["Report vulnerabilities responsibly"],
	encryption: ["openpgp4fpr:5f2de5521c63a801ab59ccb603d49de44b29100f"],
	acknowledgments: ["https://example.com/hall-of-fame"],
	preferredLanguages: ["en", "fr-FR"],
	canonical: ["https://example.com/.well-known/security.txt"],
	policy: ["https://example.com/security-policy"],
	hiring: ["https://example.com/jobs/security"],
	extensions: { CSAF: ["https://example.com/.well-known/csaf/provider-metadata.json"] },
};

describe("security.txt generator", () => {
	it("validates and normalizes a Date expiration", () => {
		expect(generateSecurityTxt({ ...config, expires: new Date(config.expires) }).expires).toBe(
			"2099-12-31T23:59:59.000Z",
		);
	});

	it("serializes every RFC field with LF line endings", () => {
		expect(generateSecurityTxtText(config)).toBe(
			[
				"# Report vulnerabilities responsibly",
				"Contact: mailto:security@example.com",
				"Contact: https://example.com/security",
				"Expires: 2099-12-31T23:59:59Z",
				"Encryption: openpgp4fpr:5f2de5521c63a801ab59ccb603d49de44b29100f",
				"Acknowledgments: https://example.com/hall-of-fame",
				"Preferred-Languages: en, fr-FR",
				"Canonical: https://example.com/.well-known/security.txt",
				"Policy: https://example.com/security-policy",
				"Hiring: https://example.com/jobs/security",
				"CSAF: https://example.com/.well-known/csaf/provider-metadata.json",
				"",
			].join("\n"),
		);
	});

	it("generates provider metadata", () => {
		const file = generateSecurityTxtFile(config);
		expect(file).toMatchObject({
			filename: "security.txt",
			path: "/.well-known/security.txt",
			contentType: "text/plain; charset=utf-8",
			data: config,
		});
		expect(file.body).toBe(generateSecurityTxtText(config));
	});

	it("creates a configured provider", () => {
		const provider = securityTxt(config);
		expect(provider.name).toBe("security-txt");
		expect(provider.path).toBe("/.well-known/security.txt");
		expect(provider.generate()).toEqual(generateSecurityTxtFile(config));
	});

	it("returns safe validation results", () => {
		expect(safeGenerateSecurityTxt(config)).toMatchObject({ success: true });
		expect(safeGenerateSecurityTxt({ contacts: [], expires: config.expires }).success).toBe(
			false,
		);
	});

	it.each([
		["missing contacts", { expires: config.expires }],
		["empty contacts", { contacts: [], expires: config.expires }],
		["a relative contact", { contacts: ["security@example.com"], expires: config.expires }],
		["an insecure web contact", { contacts: ["http://example.com"], expires: config.expires }],
		["an expired timestamp", { contacts: config.contacts, expires: "2020-01-01T00:00:00Z" }],
		["an invalid timestamp", { contacts: config.contacts, expires: "tomorrow" }],
		[
			"an insecure policy URL",
			{ contacts: config.contacts, expires: config.expires, policy: ["http://example.com"] },
		],
		[
			"an invalid language",
			{
				contacts: config.contacts,
				expires: config.expires,
				preferredLanguages: ["not_a_tag"],
			},
		],
		[
			"a line injection",
			{ contacts: ["mailto:security@example.com\nExpires: never"], expires: config.expires },
		],
		[
			"an invalid extension name",
			{
				contacts: config.contacts,
				expires: config.expires,
				extensions: { "Bad Field": ["x"] },
			},
		],
		[
			"a standard field disguised as an extension",
			{ contacts: config.contacts, expires: config.expires, extensions: { Contact: ["x"] } },
		],
		["unknown properties", { ...config, unknown: true }],
	])("rejects %s", (_name, input) => {
		expect(() => generateSecurityTxt(input)).toThrow();
	});
});
