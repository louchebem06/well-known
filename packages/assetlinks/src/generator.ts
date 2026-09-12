import { assetLinksSchema } from "./schema.js";
import type { AssetLinkStatement } from "./types.js";

export interface GeneratedAssetLinks {
	filename: "assetlinks.json";
	path: "/.well-known/assetlinks.json";
	contentType: "application/json";
	data: AssetLinkStatement[];
	body: string;
}

/** Validate an Asset Links configuration and return its statement list. */
export function generateAssetLinks(input: unknown): AssetLinkStatement[] {
	return assetLinksSchema.parse(input).statements;
}

/** Safely validate an Asset Links configuration without throwing. */
export function safeGenerateAssetLinks(input: unknown) {
	const result = assetLinksSchema.safeParse(input);
	if (!result.success) return result;
	return { ...result, data: result.data.statements };
}

/** Validate and serialize an Asset Links statement list. */
export function generateAssetLinksJson(input: unknown, options?: { pretty?: boolean }): string {
	return JSON.stringify(
		generateAssetLinks(input),
		null,
		options?.pretty === false ? undefined : "\t",
	);
}

/** Generate all metadata required to serve an assetlinks.json file. */
export function generateAssetLinksFile(
	input: unknown,
	options?: { pretty?: boolean },
): GeneratedAssetLinks {
	const data = generateAssetLinks(input);
	return {
		filename: "assetlinks.json",
		path: "/.well-known/assetlinks.json",
		contentType: "application/json",
		data,
		body: JSON.stringify(data, null, options?.pretty === false ? undefined : "\t"),
	};
}
