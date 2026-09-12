import { describe, expect, it } from "vitest";
import {
	githubReleaseGroups,
	resolveReleasePlan,
	sortForPublishing,
	type PackageManifest,
} from "./release-plan.js";

const manifests: PackageManifest[] = [
	{ name: "@well-known/core", version: "1.0.0" },
	{
		name: "@well-known/framework",
		version: "1.0.0",
		dependencies: { "@well-known/core": "workspace:*" },
	},
];

describe("release plans", () => {
	it("resolves a grouped release", () => {
		const plan = {
			mode: "grouped" as const,
			version: "1.1.0",
			packages: manifests.map((manifest) => manifest.name),
			tag: "latest",
		};
		const releases = resolveReleasePlan(plan, manifests);
		expect(releases).toEqual([
			{ name: "@well-known/core", version: "1.1.0" },
			{ name: "@well-known/framework", version: "1.1.0" },
		]);
		expect(githubReleaseGroups(plan, releases)).toMatchObject([{ tag: "v1.1.0" }]);
	});

	it("resolves independent versions and tags", () => {
		const plan = {
			mode: "independent" as const,
			versions: {
				"@well-known/core": "1.2.0",
				"@well-known/framework": "1.1.0",
			},
			tag: "next",
		};
		const releases = resolveReleasePlan(plan, manifests);
		expect(githubReleaseGroups(plan, releases).map((group) => group.tag)).toEqual([
			"@well-known/core@1.2.0",
			"@well-known/framework@1.1.0",
		]);
	});

	it("publishes internal dependencies first", () => {
		const releases = [
			{ name: "@well-known/framework", version: "1.1.0" },
			{ name: "@well-known/core", version: "1.1.0" },
		];
		expect(sortForPublishing(releases, manifests).map((release) => release.name)).toEqual([
			"@well-known/core",
			"@well-known/framework",
		]);
	});

	it.each([
		["empty plan", { mode: "grouped", version: "1.0.0", packages: [], tag: "latest" }],
		[
			"unknown package",
			{ mode: "grouped", version: "1.0.0", packages: ["unknown"], tag: "latest" },
		],
		[
			"invalid version",
			{
				mode: "grouped",
				version: "version-one",
				packages: ["@well-known/core"],
				tag: "latest",
			},
		],
		[
			"invalid tag",
			{
				mode: "grouped",
				version: "1.0.0",
				packages: ["@well-known/core"],
				tag: "invalid tag",
			},
		],
	])("rejects an %s", (_name, plan) => {
		expect(() => resolveReleasePlan(plan as never, manifests)).toThrow();
	});
});
