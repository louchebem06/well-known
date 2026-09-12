import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { generateAssetLinksFile } from "./generator.js";
import type { AssetLinks } from "./types.js";

/** Digital Asset Links well-known provider. */
export const assetLinksProvider: WellKnownProvider<AssetLinks> = {
	name: "assetlinks",
	path: "/.well-known/assetlinks.json",
	generate(config) {
		return generateAssetLinksFile(config);
	},
};

/** Create a configured Digital Asset Links provider. */
export function assetLinks(config: AssetLinks): WellKnownProviderInstance {
	return {
		name: assetLinksProvider.name,
		path: assetLinksProvider.path,
		generate() {
			return assetLinksProvider.generate(config);
		},
	};
}
