import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";

import { generateAppleAppSiteAssociationFile } from "./generator.js";
import type { AppleAppSiteAssociation } from "./types.js";

/**
 * Apple App Site Association well-known provider.
 */
export const appleAppSiteAssociationProvider: WellKnownProvider<AppleAppSiteAssociation> = {
	name: "apple-app-site-association",
	path: "/.well-known/apple-app-site-association",

	generate(config) {
		return generateAppleAppSiteAssociationFile(config);
	},
};

/**
 * Create a configured Apple App Site Association provider.
 */
export function appleAppSiteAssociation(
	config: AppleAppSiteAssociation,
): WellKnownProviderInstance {
	return {
		name: appleAppSiteAssociationProvider.name,
		path: appleAppSiteAssociationProvider.path,

		generate() {
			return appleAppSiteAssociationProvider.generate(config);
		},
	};
}
