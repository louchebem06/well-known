import { z } from "zod";

const absoluteHttpUrlSchema = z
	.string()
	.url("URL must be absolute.")
	.refine((value) => {
		try {
			const protocol = new URL(value).protocol;
			return protocol === "http:" || protocol === "https:";
		} catch {
			return false;
		}
	}, "URL must use HTTP or HTTPS.");

export const assetLinkRelationSchema = z.string().min(1, "Relation cannot be empty.");

export const androidPackageNameSchema = z
	.string()
	.regex(/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/, "Invalid Android package name.");

export const sha256CertificateFingerprintSchema = z
	.string()
	.regex(
		/^(?:[A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/,
		"SHA-256 fingerprint must contain 32 hexadecimal bytes separated by ':'.",
	);

export const androidAppTargetSchema = z
	.object({
		namespace: z.literal("android_app"),
		package_name: androidPackageNameSchema,
		sha256_cert_fingerprints: z
			.array(sha256CertificateFingerprintSchema)
			.min(1, "Android targets must contain at least one SHA-256 fingerprint."),
	})
	.strict();

export const webTargetSchema = z
	.object({
		namespace: z.literal("web"),
		site: absoluteHttpUrlSchema,
	})
	.strict();

export const assetLinkTargetSchema = z.union([androidAppTargetSchema, webTargetSchema]);

export const assetLinkTargetStatementSchema = z
	.object({
		relation: z
			.array(assetLinkRelationSchema)
			.min(1, "Relations must contain at least one item."),
		target: assetLinkTargetSchema,
	})
	.strict();

export const assetLinkIncludeStatementSchema = z
	.object({
		include: absoluteHttpUrlSchema,
	})
	.strict();

export const assetLinkStatementSchema = z.union([
	assetLinkTargetStatementSchema,
	assetLinkIncludeStatementSchema,
]);

export const assetLinksSchema = z
	.object({
		statements: z
			.array(assetLinkStatementSchema)
			.min(1, "Asset Links must contain at least one statement."),
	})
	.strict();

export type AssetLinksInput = z.input<typeof assetLinksSchema>;
export type AssetLinksOutput = z.output<typeof assetLinksSchema>;
