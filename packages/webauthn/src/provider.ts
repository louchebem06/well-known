import type { WellKnownProvider, WellKnownProviderInstance } from "@well-known-js/core";
import { generateWebAuthnFile } from "./generator.js";
import type { WebAuthn } from "./types.js";

export const webAuthnProvider: WellKnownProvider<WebAuthn> = {
	name: "webauthn",
	path: "/.well-known/webauthn",
	generate: generateWebAuthnFile,
};

export function webAuthn(config: WebAuthn): WellKnownProviderInstance {
	return {
		name: webAuthnProvider.name,
		path: webAuthnProvider.path,
		generate: () => webAuthnProvider.generate(config),
	};
}
