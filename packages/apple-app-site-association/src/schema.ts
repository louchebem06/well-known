import { z } from "zod";

const appleApplicationIdentifierSchema = z
	.string()
	.min(1, "Application identifier cannot be empty.")
	.regex(/^[A-Za-z0-9]+(?:\.[A-Za-z0-9_-]+)+$/, "Invalid Apple application identifier format.");

const applePathPatternSchema = z
	.string()
	.min(1, "Path pattern cannot be empty.")
	.refine((value) => value.startsWith("/"), {
		message: "Path pattern must start with '/'.",
	})
	.refine((value) => !value.startsWith("http://") && !value.startsWith("https://"), {
		message: "Path pattern must not be an absolute URL.",
	});

const appleFragmentPatternSchema = z.string().min(1, "Fragment pattern cannot be empty.");

const appleQueryParameterPatternSchema = z
	.string()
	.min(1, "Query parameter pattern cannot be empty.");

const appleQueryParametersSchema = z
	.record(
		z.string().min(1, "Query parameter name cannot be empty."),
		appleQueryParameterPatternSchema,
	)
	.refine((value) => Object.keys(value).length > 0, {
		message: "Query parameters cannot be empty.",
	});

export const appleAppLinkDefaultsSchema = z.object({
	caseSensitive: z.boolean().optional(),
	percentEncoded: z.boolean().optional(),
});

export const appleAppLinkComponentSchema = z
	.object({
		"/": applePathPatternSchema.optional(),
		"?": appleQueryParametersSchema.optional(),
		"#": appleFragmentPatternSchema.optional(),
		exclude: z.boolean().optional(),
		comment: z.string().optional(),
	})
	.strict()
	.refine(
		(value) => value["/"] !== undefined || value["?"] !== undefined || value["#"] !== undefined,
		{
			message: "A component must contain at least one matching rule: '/', '?' or '#'.",
		},
	);

export const appleLegacyPathSchema = z.string().min(1, "Legacy path cannot be empty.");

export const appleLegacyAppLinkDetailSchema = z
	.object({
		appID: appleApplicationIdentifierSchema,

		paths: z
			.array(appleLegacyPathSchema)
			.min(1, "Legacy paths must contain at least one item."),
	})
	.strict();

export const appleModernSingleAppLinkDetailSchema = z
	.object({
		appID: appleApplicationIdentifierSchema,

		components: z
			.array(appleAppLinkComponentSchema)
			.min(1, "Components must contain at least one item."),

		defaults: appleAppLinkDefaultsSchema.optional(),
	})
	.strict();

export const appleModernMultipleAppLinkDetailSchema = z
	.object({
		appIDs: z
			.array(appleApplicationIdentifierSchema)
			.min(1, "appIDs must contain at least one application."),

		components: z
			.array(appleAppLinkComponentSchema)
			.min(1, "Components must contain at least one item."),

		defaults: appleAppLinkDefaultsSchema.optional(),
	})
	.strict();

export const appleModernAppLinkDetailSchema = z.union([
	appleModernSingleAppLinkDetailSchema,
	appleModernMultipleAppLinkDetailSchema,
]);

export const appleAppLinkDetailSchema = z.union([
	appleLegacyAppLinkDetailSchema,
	appleModernSingleAppLinkDetailSchema,
	appleModernMultipleAppLinkDetailSchema,
]);

export const appleAppLinksSchema = z
	.object({
		/**
		 * Legacy compatibility field.
		 *
		 * If present, it must always be an empty array.
		 */
		apps: z.tuple([]).optional(),

		defaults: appleAppLinkDefaultsSchema.optional(),

		details: z
			.array(appleAppLinkDetailSchema)
			.min(1, "applinks.details must contain at least one item."),
	})
	.strict();

export const appleWebCredentialsSchema = z
	.object({
		apps: z
			.array(appleApplicationIdentifierSchema)
			.min(1, "webcredentials.apps must contain at least one application."),
	})
	.strict();

export const appleAppClipsSchema = z
	.object({
		apps: z
			.array(appleApplicationIdentifierSchema)
			.min(1, "appclips.apps must contain at least one application."),
	})
	.strict();

export const appleAppSiteAssociationSchema = z
	.object({
		applinks: appleAppLinksSchema.optional(),

		webcredentials: appleWebCredentialsSchema.optional(),

		appclips: appleAppClipsSchema.optional(),
	})
	.strict()
	.refine(
		(value) =>
			value.applinks !== undefined ||
			value.webcredentials !== undefined ||
			value.appclips !== undefined,
		{
			message: "Apple App Site Association must contain at least one service.",
		},
	);

export type AppleAppSiteAssociationInput = z.input<typeof appleAppSiteAssociationSchema>;

export type AppleAppSiteAssociationOutput = z.output<typeof appleAppSiteAssociationSchema>;
