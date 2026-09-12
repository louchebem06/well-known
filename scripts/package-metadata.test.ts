import { describe, expect, it } from "vitest";
import { readPackageManifests } from "./release-files.js";

describe("package metadata", () => {
	it("provides useful and unique npm keywords for every published package", async () => {
		const packages = await readPackageManifests();

		for (const { manifest } of packages.filter(({ manifest }) => !manifest.private)) {
			expect(manifest.keywords, manifest.name).toEqual(
				expect.arrayContaining(["well-known", "typescript"]),
			);
			expect(manifest.keywords!.length, manifest.name).toBeGreaterThanOrEqual(5);
			expect(new Set(manifest.keywords).size, manifest.name).toBe(manifest.keywords!.length);
		}
	});
});
