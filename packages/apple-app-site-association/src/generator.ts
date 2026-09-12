import { appleAppSiteAssociationSchema } from "./schema.js";
import type { AppleAppSiteAssociation } from "./types.js";

export interface GeneratedAppleAppSiteAssociation {
	filename: "apple-app-site-association";
	path: "/.well-known/apple-app-site-association";
	contentType: "application/json";
	data: AppleAppSiteAssociation;
	body: string;
}

/**
 * Validate and normalize an Apple App Site Association configuration.
 *
 * Throws a ZodError when the configuration is invalid.
 */
export function generateAppleAppSiteAssociation(input: unknown): AppleAppSiteAssociation {
	return appleAppSiteAssociationSchema.parse(input);
}

/**
 * Safely validate and normalize an Apple App Site Association configuration.
 *
 * Returns a validation result instead of throwing a ZodError when the configuration is invalid.
 */
export function safeGenerateAppleAppSiteAssociation(input: unknown) {
	return appleAppSiteAssociationSchema.safeParse(input);
}

/**
 * Validate the configuration and serialize it as JSON.
 */
export function generateAppleAppSiteAssociationJson(
	input: unknown,
	options?: {
		pretty?: boolean;
	},
): string {
	const data = generateAppleAppSiteAssociation(input);

	return JSON.stringify(data, null, options?.pretty === false ? undefined : "\t");
}

/**
 * Generate all metadata required to serve an AASA file.
 */
export function generateAppleAppSiteAssociationFile(
	input: unknown,
	options?: {
		pretty?: boolean;
	},
): GeneratedAppleAppSiteAssociation {
	const data = generateAppleAppSiteAssociation(input);

	const body = JSON.stringify(data, null, options?.pretty === false ? undefined : "\t");

	return {
		filename: "apple-app-site-association",
		path: "/.well-known/apple-app-site-association",
		contentType: "application/json",
		data,
		body,
	};
}
