import { webAuthnSchema } from "./schema.js";
import type { WebAuthn, WebAuthnJsonOptions } from "./types.js";

export interface GeneratedWebAuthn {
	filename: "webauthn";
	path: "/.well-known/webauthn";
	contentType: "application/json";
	data: WebAuthn;
	body: string;
}

export function generateWebAuthn(input: unknown): WebAuthn {
	return webAuthnSchema.parse(input);
}

export function safeGenerateWebAuthn(input: unknown) {
	return webAuthnSchema.safeParse(input);
}

export function generateWebAuthnJson(input: unknown, options: WebAuthnJsonOptions = {}): string {
	const data = generateWebAuthn(input);
	return JSON.stringify(data, null, options.pretty === false ? undefined : "\t");
}

export function generateWebAuthnFile(
	input: unknown,
	options: WebAuthnJsonOptions = {},
): GeneratedWebAuthn {
	const data = generateWebAuthn(input);
	return {
		filename: "webauthn",
		path: "/.well-known/webauthn",
		contentType: "application/json",
		data,
		body: generateWebAuthnJson(data, options),
	};
}
