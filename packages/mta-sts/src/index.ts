import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export interface MtaStsPolicy {
	version: "STSv1";
	mode: "enforce" | "testing" | "none";
	mx?: string[];
	maxAge: number;
	extensions?: Record<string, string>;
}

const domainLabel = "(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)";
const domainPattern = new RegExp(`^(?:\\*\\.)?${domainLabel}(?:\\.${domainLabel})+$`);
const extensionName = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$/;
const reservedFields = new Set(["version", "mode", "mx", "max_age"]);

function isExtensionValue(value: string): boolean {
	if (value.length === 0 || value.trim() !== value) return false;
	return [...value].every((character) => {
		const codePoint = character.codePointAt(0);
		return codePoint !== undefined && codePoint >= 0x20 && codePoint !== 0x7f;
	});
}

export const mtaStsSchema = z
	.object({
		version: z.literal("STSv1"),
		mode: z.enum(["enforce", "testing", "none"]),
		mx: z
			.array(
				z.string().regex(domainPattern, "MX must be an ASCII domain or wildcard domain."),
			)
			.min(1)
			.optional(),
		maxAge: z.number().int().min(0).max(31_557_600),
		extensions: z
			.record(
				z.string().regex(extensionName, "Invalid MTA-STS extension field name."),
				z.string().refine(isExtensionValue, "Invalid MTA-STS extension value."),
			)
			.optional(),
	})
	.strict()
	.superRefine((value, context) => {
		if (value.mode !== "none" && value.mx === undefined) {
			context.addIssue({
				code: "custom",
				path: ["mx"],
				message: "At least one MX pattern is required unless mode is none.",
			});
		}
		for (const name of Object.keys(value.extensions ?? {})) {
			if (reservedFields.has(name.toLowerCase())) {
				context.addIssue({
					code: "custom",
					path: ["extensions", name],
					message: "Standard fields must use their dedicated property.",
				});
			}
		}
	});

export type MtaStsInput = z.input<typeof mtaStsSchema>;
export type MtaStsOutput = z.output<typeof mtaStsSchema>;

export interface GeneratedMtaSts {
	filename: "mta-sts.txt";
	path: "/.well-known/mta-sts.txt";
	contentType: "text/plain; charset=utf-8";
	data: MtaStsOutput;
	body: string;
}

export function generateMtaSts(input: unknown): MtaStsOutput {
	return mtaStsSchema.parse(input);
}

export function safeGenerateMtaSts(input: unknown) {
	return mtaStsSchema.safeParse(input);
}

export function generateMtaStsText(input: unknown): string {
	const data = generateMtaSts(input);
	const lines = [`version: ${data.version}`, `mode: ${data.mode}`];
	for (const mx of data.mx ?? []) lines.push(`mx: ${mx}`);
	lines.push(`max_age: ${data.maxAge}`);
	for (const [name, value] of Object.entries(data.extensions ?? {})) {
		lines.push(`${name}: ${value}`);
	}
	return `${lines.join("\r\n")}\r\n`;
}

export function generateMtaStsFile(input: unknown): GeneratedMtaSts {
	const data = generateMtaSts(input);
	return {
		filename: "mta-sts.txt",
		path: "/.well-known/mta-sts.txt",
		contentType: "text/plain; charset=utf-8",
		data,
		body: generateMtaStsText(data),
	};
}

export const mtaStsProvider: WellKnownProvider<MtaStsInput> = {
	name: "mta-sts",
	path: "/.well-known/mta-sts.txt",
	generate: generateMtaStsFile,
};

export function mtaSts(config: MtaStsInput): WellKnownProviderInstance {
	return {
		name: mtaStsProvider.name,
		path: mtaStsProvider.path,
		generate: () => mtaStsProvider.generate(config),
	};
}
