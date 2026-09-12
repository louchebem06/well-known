import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { generateSecurityTxtFile } from "./generator.js";
import type { SecurityTxt } from "./types.js";

export const securityTxtProvider: WellKnownProvider<SecurityTxt> = {
	name: "security-txt",
	path: "/.well-known/security.txt",
	generate: generateSecurityTxtFile,
};

export function securityTxt(config: SecurityTxt): WellKnownProviderInstance {
	return {
		name: securityTxtProvider.name,
		path: securityTxtProvider.path,
		generate: () => securityTxtProvider.generate(config),
	};
}
