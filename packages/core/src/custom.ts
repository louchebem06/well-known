import type { WellKnownProviderInstance } from "./provider.js";

export interface CustomOptions {
	path: `/.well-known/${string}`;
	contentType: string;
	body: string;
	name?: string;
}

/** Create a provider for a custom text resource, including pre-serialized JSON. */
export function custom(options: CustomOptions): WellKnownProviderInstance {
	const { path, contentType, body, name = "custom" } = options;
	const prefix = "/.well-known/";
	const segments = typeof path === "string" ? path.slice(prefix.length).split("/") : [];

	if (
		typeof path !== "string" ||
		!path.startsWith(prefix) ||
		segments.some(
			(segment) =>
				!segment || /[^A-Za-z0-9._~-]/.test(segment) || segment === "." || segment === "..",
		)
	) {
		throw new Error("Custom path must be a file under /.well-known/ with safe path segments.");
	}

	if (
		typeof contentType !== "string" ||
		/[^\t\x20-\x7e]/.test(contentType) ||
		!/^[-!#$%&'*+.^_`|~A-Za-z0-9]+\/[-!#$%&'*+.^_`|~A-Za-z0-9]+(?:[ \t]*;[^\r\n\0]+)?$/.test(
			contentType,
		)
	) {
		throw new Error(
			"Custom contentType must be a media type, such as text/plain; charset=utf-8.",
		);
	}

	if (typeof body !== "string") {
		throw new Error("Custom body must be a string. Use JSON.stringify() for JSON resources.");
	}

	return {
		name,
		path,
		generate: () => ({
			path,
			filename: segments[segments.length - 1],
			contentType,
			body,
		}),
	};
}
