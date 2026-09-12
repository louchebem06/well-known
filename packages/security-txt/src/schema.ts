import { z } from "zod";

const singleLineSchema = z
	.string()
	.min(1, "Value cannot be empty.")
	.refine((value) => !/[\r\n]/.test(value), "Value must fit on one line.");

function isAbsoluteUri(value: string): boolean {
	try {
		return Boolean(new URL(value).protocol);
	} catch {
		return false;
	}
}

function isSecureWebUri(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol !== "http:";
	} catch {
		return false;
	}
}

export const securityTxtUriSchema = singleLineSchema
	.refine(isAbsoluteUri, "Value must be an absolute URI.")
	.refine(isSecureWebUri, "Web URLs must use HTTPS.");

export const securityTxtHttpsUrlSchema = singleLineSchema
	.url("Value must be an absolute URL.")
	.refine((value) => new URL(value).protocol === "https:", "URL must use HTTPS.");

export const securityTxtLanguageSchema = singleLineSchema.refine((value) => {
	try {
		Intl.getCanonicalLocales(value);
		return true;
	} catch {
		return false;
	}
}, "Invalid BCP 47 language tag.");

export const securityTxtExpiresSchema = z
	.union([z.string().datetime({ offset: true }), z.date()])
	.transform((value) => (value instanceof Date ? value.toISOString() : value));

const uriList = (schema: typeof securityTxtUriSchema | typeof securityTxtHttpsUrlSchema) =>
	z.array(schema).min(1);

export const securityTxtSchema = z
	.object({
		contacts: uriList(securityTxtUriSchema),
		expires: securityTxtExpiresSchema,
		comments: z.array(singleLineSchema).min(1).optional(),
		acknowledgments: uriList(securityTxtHttpsUrlSchema).optional(),
		canonical: uriList(securityTxtHttpsUrlSchema).optional(),
		encryption: uriList(securityTxtUriSchema).optional(),
		hiring: uriList(securityTxtHttpsUrlSchema).optional(),
		policy: uriList(securityTxtHttpsUrlSchema).optional(),
		preferredLanguages: z.array(securityTxtLanguageSchema).min(1).optional(),
		extensions: z
			.record(
				z.string().regex(/^[A-Za-z][A-Za-z0-9-]*$/, "Invalid extension field name."),
				z.array(singleLineSchema).min(1),
			)
			.optional(),
	})
	.strict()
	.superRefine((value, context) => {
		if (Date.parse(value.expires) <= Date.now()) {
			context.addIssue({
				code: "custom",
				path: ["expires"],
				message: "Expires must be in the future.",
			});
		}

		const standardFields = new Set([
			"acknowledgments",
			"canonical",
			"contact",
			"encryption",
			"expires",
			"hiring",
			"policy",
			"preferred-languages",
		]);
		for (const name of Object.keys(value.extensions ?? {})) {
			if (standardFields.has(name.toLowerCase())) {
				context.addIssue({
					code: "custom",
					path: ["extensions", name],
					message: "Standard fields must use their dedicated property.",
				});
			}
		}
	});

export type SecurityTxtInput = z.input<typeof securityTxtSchema>;
export type SecurityTxtOutput = z.output<typeof securityTxtSchema>;
