import { z } from "zod";

function isHttpsOrigin(value: string): boolean {
	try {
		const url = new URL(value);
		return (
			url.protocol === "https:" &&
			url.username === "" &&
			url.password === "" &&
			url.pathname === "/" &&
			url.search === "" &&
			url.hash === ""
		);
	} catch {
		return false;
	}
}

export const webAuthnOriginSchema = z
	.string()
	.min(1, "Origin cannot be empty.")
	.refine(isHttpsOrigin, "Origin must be an HTTPS origin without a path, query, or fragment.");

export const webAuthnSchema = z
	.object({
		origins: z
			.array(webAuthnOriginSchema)
			.min(1, "At least one origin is required.")
			.refine(
				(origins) => new Set(origins).size === origins.length,
				"Origins must be unique.",
			),
	})
	.strict();

export type WebAuthnInput = z.input<typeof webAuthnSchema>;
export type WebAuthnOutput = z.output<typeof webAuthnSchema>;
