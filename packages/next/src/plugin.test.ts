import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withWellKnown } from "./plugin.js";

const originalCwd = process.cwd();
let root: string;

function configSource(body: string): string {
	return `export default {
	providers: [{
		name: "test",
		path: "/.well-known/apple-app-site-association",
		generate() {
			return {
				path: "/.well-known/apple-app-site-association",
				filename: "apple-app-site-association",
				contentType: "application/json",
				body: ${JSON.stringify(body)},
			};
		},
	}],
};`;
}

async function waitForFile(path: string, expected: string): Promise<void> {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		try {
			if ((await readFile(path, "utf8")) === expected) {
				return;
			}
		} catch {
			// The watcher may not have completed its write yet.
		}

		await new Promise((resolve) => setTimeout(resolve, 25));
	}

	throw new Error(`Timed out waiting for ${path}`);
}

async function waitForCall(spy: ReturnType<typeof vi.spyOn>): Promise<void> {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		if (spy.mock.calls.length > 0) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 25));
	}

	throw new Error("Timed out waiting for watcher error");
}

describe.sequential("withWellKnown", () => {
	beforeEach(async () => {
		root = await mkdtemp(join(tmpdir(), "well-known-next-"));
		process.chdir(root);
	});

	afterEach(async () => {
		process.chdir(originalCwd);
		vi.restoreAllMocks();
		await rm(root, { recursive: true, force: true });
	});

	it("generates files in the default public directory and adds content-type headers", async () => {
		await writeFile("well-known.config.ts", configSource('{"enabled":true}'));

		const configure = withWellKnown()({
			reactStrictMode: true,
			async headers() {
				return [{ source: "/existing", headers: [{ key: "X-Test", value: "true" }] }];
			},
		});

		const config = await configure("phase-production-build", { defaultConfig: {} });

		expect(config.reactStrictMode).toBe(true);
		expect(await config.headers?.()).toEqual([
			{ source: "/existing", headers: [{ key: "X-Test", value: "true" }] },
			{
				source: "/.well-known/apple-app-site-association",
				headers: [{ key: "Content-Type", value: "application/json" }],
			},
		]);
		expect(await readFile("public/.well-known/apple-app-site-association", "utf8")).toBe(
			'{"enabled":true}',
		);
	});

	it("supports custom paths and function-based Next.js configuration", async () => {
		await mkdir("config");
		await writeFile("config/custom.ts", configSource("custom"));

		const configure = withWellKnown({
			configFile: "config/custom.ts",
			publicDir: "assets",
		})(async (phase) => ({ env: { PHASE: phase } }));

		const config = await configure("phase-production-build", { defaultConfig: {} });

		expect(config.env).toEqual({ PHASE: "phase-production-build" });
		expect(await readFile("assets/.well-known/apple-app-site-association", "utf8")).toBe(
			"custom",
		);
	});

	it("fails when the initial configuration is missing or invalid", async () => {
		const configure = withWellKnown()();

		await expect(configure("phase-production-build", { defaultConfig: {} })).rejects.toThrow(
			"Configuration file not found",
		);

		await writeFile("well-known.config.ts", "export default {};");

		await expect(configure("phase-production-build", { defaultConfig: {} })).rejects.toThrow(
			"expected a providers array",
		);
	});

	it("regenerates in development and preserves the last valid file", async () => {
		const outputPath = join(root, "public/.well-known/apple-app-site-association");
		await writeFile("well-known.config.ts", configSource("first"));
		const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

		await withWellKnown()()("phase-development-server", { defaultConfig: {} });
		expect(await readFile(outputPath, "utf8")).toBe("first");

		await writeFile("well-known.config.ts", "export default {};");
		await waitForCall(error);
		expect(await readFile(outputPath, "utf8")).toBe("first");
		expect(error).toHaveBeenCalled();

		await writeFile("well-known.config.ts", configSource("second"));
		await waitForFile(outputPath, "second");
	});
});
