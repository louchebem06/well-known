import { securityTxtSchema } from "./schema.js";
import type { NormalizedSecurityTxt } from "./types.js";

export interface GeneratedSecurityTxt {
	filename: "security.txt";
	path: "/.well-known/security.txt";
	contentType: "text/plain; charset=utf-8";
	data: NormalizedSecurityTxt;
	body: string;
}

export function generateSecurityTxt(input: unknown): NormalizedSecurityTxt {
	return securityTxtSchema.parse(input);
}

export function safeGenerateSecurityTxt(input: unknown) {
	return securityTxtSchema.safeParse(input);
}

function append(lines: string[], name: string, values: string[] | undefined): void {
	for (const value of values ?? []) lines.push(`${name}: ${value}`);
}

export function generateSecurityTxtText(input: unknown): string {
	const data = generateSecurityTxt(input);
	const lines = (data.comments ?? []).map((comment) => `# ${comment}`);
	append(lines, "Contact", data.contacts);
	lines.push(`Expires: ${data.expires}`);
	append(lines, "Encryption", data.encryption);
	append(lines, "Acknowledgments", data.acknowledgments);
	if (data.preferredLanguages) {
		lines.push(`Preferred-Languages: ${data.preferredLanguages.join(", ")}`);
	}
	append(lines, "Canonical", data.canonical);
	append(lines, "Policy", data.policy);
	append(lines, "Hiring", data.hiring);
	for (const [name, values] of Object.entries(data.extensions ?? {})) append(lines, name, values);
	return `${lines.join("\n")}\n`;
}

export function generateSecurityTxtFile(input: unknown): GeneratedSecurityTxt {
	const data = generateSecurityTxt(input);
	return {
		filename: "security.txt",
		path: "/.well-known/security.txt",
		contentType: "text/plain; charset=utf-8",
		data,
		body: generateSecurityTxtText(data),
	};
}
