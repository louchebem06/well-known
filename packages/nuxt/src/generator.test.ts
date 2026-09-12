import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { WellKnownConfig } from "@well-known/core";
import { afterEach, describe, expect, it } from "vitest";

import { generateWellKnownFiles } from "./generator.js";

let root: string;

afterEach(async () => {
	if (root) {
		await rm(root, { recursive: true, force: true });
	}
});

describe("generateWellKnownFiles", () => {
	it("writes generated files to the configured public directory", async () => {
		root = await mkdtemp(join(tmpdir(), "well-known-nuxt-"));
		const config: WellKnownConfig = {
			providers: [
				{
					name: "test",
					path: "/.well-known/apple-app-site-association",
					generate: () => ({
						path: "/.well-known/apple-app-site-association",
						filename: "apple-app-site-association",
						contentType: "application/json",
						body: '{"enabled":true}',
					}),
				},
			],
		};

		const files = await generateWellKnownFiles(root, "public", config);

		expect(files).toHaveLength(1);
		expect(
			await readFile(join(root, "public/.well-known/apple-app-site-association"), "utf8"),
		).toBe('{"enabled":true}');
	});
});
