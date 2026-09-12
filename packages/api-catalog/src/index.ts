import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { z } from "zod";

export const API_CATALOG_PROFILE = "https://www.rfc-editor.org/info/rfc9727" as const;
export const API_CATALOG_CONTENT_TYPE =
	`application/linkset+json; profile="${API_CATALOG_PROFILE}"` as const;

const internationalizedAttributeSchema = z
	.object({
		value: z.string(),
		language: z.string().min(1).optional(),
	})
	.strict();

function isUriReference(value: string): boolean {
	if (
		/\s/u.test(value) ||
		[...value].some((character) => {
			const codePoint = character.codePointAt(0) ?? 0;
			return codePoint <= 31 || codePoint === 127;
		})
	) {
		return false;
	}
	try {
		new URL(value, "https://linkset.invalid/");
		return true;
	} catch {
		return false;
	}
}

function isRelationType(value: string): boolean {
	if (/^[a-z][a-z0-9.-]*$/u.test(value)) return true;
	try {
		return new URL(value).protocol !== "";
	} catch {
		return false;
	}
}

export const apiCatalogLinkTargetSchema = z
	.object({
		href: z.string().refine(isUriReference, "href must be a valid URI reference."),
		hreflang: z.array(z.string().min(1)).min(1).optional(),
		media: z.string().min(1).optional(),
		title: z.string().optional(),
		"title*": z.array(internationalizedAttributeSchema).min(1).optional(),
		type: z.string().min(1).optional(),
	})
	.loose()
	.superRefine((target, context) => {
		const standardAttributes = new Set([
			"href",
			"hreflang",
			"media",
			"title",
			"title*",
			"type",
		]);
		for (const [attribute, value] of Object.entries(target)) {
			if (standardAttributes.has(attribute)) continue;
			const result = attribute.endsWith("*")
				? z.array(internationalizedAttributeSchema).min(1).safeParse(value)
				: z.array(z.string()).min(1).safeParse(value);
			if (!result.success) {
				context.addIssue({
					code: "custom",
					path: [attribute],
					message: "Extension target attributes must use the RFC 9264 array format.",
				});
			}
		}
	});

export type ApiCatalogLinkTargetInput = z.input<typeof apiCatalogLinkTargetSchema>;
export type ApiCatalogLinkTargetOutput = z.output<typeof apiCatalogLinkTargetSchema>;

export const apiCatalogLinkContextSchema = z
	.record(z.string(), z.unknown())
	.superRefine((linkContext, context) => {
		if ("anchor" in linkContext) {
			const anchor = linkContext.anchor;
			if (typeof anchor !== "string" || !isUriReference(anchor)) {
				context.addIssue({
					code: "custom",
					path: ["anchor"],
					message: "anchor must be a valid URI reference.",
				});
			}
		}

		const relations = Object.entries(linkContext).filter(([name]) => name !== "anchor");
		if (relations.length === 0) {
			context.addIssue({
				code: "custom",
				message: "A link context must contain a relation.",
			});
		}

		for (const [relation, targets] of relations) {
			if (!isRelationType(relation)) {
				context.addIssue({
					code: "custom",
					path: [relation],
					message: "Relation must be a registered name or an absolute URI.",
				});
				continue;
			}
			const result = z.array(apiCatalogLinkTargetSchema).min(1).safeParse(targets);
			if (!result.success) {
				for (const issue of result.error.issues) {
					context.addIssue({
						code: "custom",
						path: [relation, ...issue.path],
						message: issue.message,
					});
				}
			}
		}
	});

export type ApiCatalogLinkContext = z.input<typeof apiCatalogLinkContextSchema>;

export const apiCatalogSchema = z
	.object({
		linkset: z.array(apiCatalogLinkContextSchema).min(1),
	})
	.strict();

export type ApiCatalogInput = z.input<typeof apiCatalogSchema>;
export type ApiCatalogOutput = z.output<typeof apiCatalogSchema>;

export interface ApiCatalogJsonOptions {
	pretty?: boolean;
}

export interface GeneratedApiCatalog {
	filename: "api-catalog";
	path: "/.well-known/api-catalog";
	contentType: typeof API_CATALOG_CONTENT_TYPE;
	data: ApiCatalogOutput;
	body: string;
}

export function generateApiCatalog(input: unknown): ApiCatalogOutput {
	return apiCatalogSchema.parse(input);
}

export function safeGenerateApiCatalog(input: unknown) {
	return apiCatalogSchema.safeParse(input);
}

export function generateApiCatalogJson(
	input: unknown,
	options: ApiCatalogJsonOptions = {},
): string {
	return JSON.stringify(
		generateApiCatalog(input),
		null,
		options.pretty === false ? undefined : "\t",
	);
}

export function generateApiCatalogFile(
	input: unknown,
	options: ApiCatalogJsonOptions = {},
): GeneratedApiCatalog {
	const data = generateApiCatalog(input);
	return {
		filename: "api-catalog",
		path: "/.well-known/api-catalog",
		contentType: API_CATALOG_CONTENT_TYPE,
		data,
		body: generateApiCatalogJson(data, options),
	};
}

export const apiCatalogProvider: WellKnownProvider<ApiCatalogInput> = {
	name: "api-catalog",
	path: "/.well-known/api-catalog",
	generate: generateApiCatalogFile,
};

export function apiCatalog(config: ApiCatalogInput): WellKnownProviderInstance {
	return {
		name: apiCatalogProvider.name,
		path: apiCatalogProvider.path,
		generate: () => apiCatalogProvider.generate(config),
	};
}
