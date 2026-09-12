import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { WellKnownConfig, WellKnownGeneratedFile } from "@well-known-js/core";

function generateFiles(config: WellKnownConfig): Map<string, WellKnownGeneratedFile> {
	const files = new Map<string, WellKnownGeneratedFile>();

	for (const provider of config.providers) {
		const file = provider.generate();

		if (files.has(file.path)) {
			throw new Error(`Duplicate well-known provider path: ${file.path}`);
		}

		files.set(file.path, file);
	}

	return files;
}

export function wellKnown(config: WellKnownConfig): RequestHandler {
	const files = generateFiles(config);

	return (request: Request, response: Response, next: NextFunction): void => {
		if (request.method !== "GET" && request.method !== "HEAD") {
			next();
			return;
		}

		const file = files.get(request.path);

		if (!file) {
			next();
			return;
		}

		response.type(file.contentType).send(file.body);
	};
}
