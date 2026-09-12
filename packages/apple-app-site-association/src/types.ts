/**
 * Apple App Site Association (AASA)
 *
 * File:
 * /.well-known/apple-app-site-association
 */
export interface AppleAppSiteAssociation {
	/**
	 * Universal Links configuration.
	 */
	applinks?: AppleAppLinks;

	/**
	 * Shared Web Credentials configuration.
	 */
	webcredentials?: AppleWebCredentials;

	/**
	 * App Clips configuration.
	 */
	appclips?: AppleAppClips;
}

/**
 * Universal Links configuration.
 */
export interface AppleAppLinks {
	/**
	 * Legacy compatibility field.
	 *
	 * When present, this array must stay empty.
	 *
	 * Example:
	 * apps: []
	 */
	apps?: [];

	/**
	 * Default matching behavior applied to app link rules.
	 */
	defaults?: AppleAppLinkDefaults;

	/**
	 * Applications and their matching rules.
	 */
	details: AppleAppLinkDetail[];
}

/**
 * A details entry can use either:
 *
 * - Legacy format: appID + paths
 * - Modern format: appID/appIDs + components
 */
export type AppleAppLinkDetail = AppleLegacyAppLinkDetail | AppleModernAppLinkDetail;

/**
 * Legacy Universal Links format.
 *
 * Example:
 *
 * {
 *     appID: "ABCDE12345.com.example.app",
 *     paths: [
 *         "/products/*",
 *         "NOT /products/private/*"
 *     ]
 * }
 */
export interface AppleLegacyAppLinkDetail {
	/**
	 * Application identifier.
	 *
	 * Format:
	 * <Application Identifier Prefix>.<Bundle Identifier>
	 *
	 * Example:
	 * ABCDE12345.com.example.app
	 */
	appID: AppleApplicationIdentifier;

	/**
	 * Legacy URL path patterns.
	 */
	paths: AppleLegacyPath[];
}

/**
 * Modern Universal Links format.
 */
export type AppleModernAppLinkDetail =
	AppleModernSingleAppLinkDetail | AppleModernMultipleAppLinkDetail;

/**
 * Modern format targeting one application.
 */
export interface AppleModernSingleAppLinkDetail {
	/**
	 * Single application identifier.
	 *
	 * Mutually exclusive with appIDs.
	 */
	appID: AppleApplicationIdentifier;

	appIDs?: never;

	/**
	 * URL matching rules.
	 */
	components: AppleAppLinkComponent[];

	/**
	 * Defaults specific to this application/rule group.
	 */
	defaults?: AppleAppLinkDefaults;
}

/**
 * Modern format targeting multiple applications.
 */
export interface AppleModernMultipleAppLinkDetail {
	appID?: never;

	/**
	 * One or more application identifiers sharing the same rules.
	 */
	appIDs: AppleApplicationIdentifier[];

	/**
	 * URL matching rules.
	 */
	components: AppleAppLinkComponent[];

	/**
	 * Defaults specific to this application/rule group.
	 */
	defaults?: AppleAppLinkDefaults;
}

/**
 * A modern Universal Links matching rule.
 *
 * A rule can match:
 *
 * - pathname with "/"
 * - query parameters with "?"
 * - fragment with "#"
 *
 * Multiple conditions can be combined.
 */
export interface AppleAppLinkComponent {
	/**
	 * URL path pattern.
	 *
	 * Examples:
	 * "/products/*"
	 * "/forgot-password/password-setup"
	 */
	"/"?: ApplePathPattern;

	/**
	 * Query parameter matching rules.
	 *
	 * Example:
	 *
	 * {
	 *     token: "*"
	 * }
	 */
	"?"?: AppleQueryParameters;

	/**
	 * URL fragment matching rule.
	 *
	 * Corresponds to the part after "#".
	 */
	"#"?: AppleFragmentPattern;

	/**
	 * When true, matching URLs are explicitly excluded
	 * from Universal Links.
	 */
	exclude?: boolean;

	/**
	 * Human-readable documentation for this rule.
	 *
	 * Does not affect matching.
	 */
	comment?: string;
}

/**
 * Default matching configuration.
 */
export interface AppleAppLinkDefaults {
	/**
	 * Controls whether matching is case-sensitive.
	 */
	caseSensitive?: boolean;

	/**
	 * Controls matching behavior for percent-encoded URL components.
	 */
	percentEncoded?: boolean;
}

/**
 * Shared Web Credentials configuration.
 */
export interface AppleWebCredentials {
	/**
	 * Applications associated with this website
	 * for shared credentials.
	 *
	 * Must contain application identifiers.
	 */
	apps: AppleApplicationIdentifier[];
}

/**
 * App Clips configuration.
 */
export interface AppleAppClips {
	/**
	 * App Clip application identifiers.
	 */
	apps: AppleApplicationIdentifier[];
}

/**
 * Apple application identifier.
 *
 * Format:
 * <Application Identifier Prefix>.<Bundle Identifier>
 *
 * Example:
 * ABCDE12345.com.example.app
 */
export type AppleApplicationIdentifier = string;

/**
 * Modern URL path pattern.
 *
 * Examples:
 * "/"
 * "/*"
 * "/products/*"
 * "/users/????"
 */
export type ApplePathPattern = string;

/**
 * URL fragment pattern.
 */
export type AppleFragmentPattern = string;

/**
 * Query parameter patterns.
 *
 * Example:
 *
 * {
 *     token: "*",
 *     id: "????"
 * }
 */
export type AppleQueryParameters = Record<string, AppleQueryParameterPattern>;

/**
 * Query parameter matching pattern.
 */
export type AppleQueryParameterPattern = string;

/**
 * Legacy Universal Links path rule.
 *
 * Examples:
 *
 * "/products/*"
 * "/users/*"
 * "NOT /products/private/*"
 */
export type AppleLegacyPath = string;
