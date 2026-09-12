import { describe, expect, it } from "vitest";
import {
	githubReleaseGroups,
	resolveReleasePlan,
	sortForPublishing,
	suggestReleasePlan,
	type PackageManifest,
} from "./release-plan.js";

const manifests: PackageManifest[] = [
	{ name: "@well-known-js/core", version: "1.0.0" },
	{
		name: "@well-known-js/framework",
		version: "1.0.0",
		dependencies: { "@well-known-js/core": "workspace:*" },
	},
];

describe("release plans", () => {
	it("suggests a grouped patch release when every next version matches", () => {
		expect(
			suggestReleasePlan(
				{
					mode: "auto",
					bump: "patch",
					packageNames: manifests.map((manifest) => manifest.name),
					publishedPackageNames: new Set(manifests.map((manifest) => manifest.name)),
					tag: "latest",
				},
				manifests,
			),
		).toEqual({
			mode: "grouped",
			version: "1.0.1",
			packages: ["@well-known-js/core", "@well-known-js/framework"],
			tag: "latest",
		});
	});

	it("suggests independent versions when new and published packages differ", () => {
		expect(
			suggestReleasePlan(
				{
					mode: "auto",
					bump: "patch",
					packageNames: manifests.map((manifest) => manifest.name),
					publishedPackageNames: new Set(["@well-known-js/core"]),
					tag: "latest",
				},
				manifests,
			),
		).toEqual({
			mode: "independent",
			versions: {
				"@well-known-js/core": "1.0.1",
				"@well-known-js/framework": "1.0.0",
			},
			tag: "latest",
		});
	});

	it("applies exact version overrides and includes their packages", () => {
		expect(
			suggestReleasePlan(
				{
					mode: "independent",
					bump: "minor",
					packageNames: ["@well-known-js/core"],
					publishedPackageNames: new Set(manifests.map((manifest) => manifest.name)),
					versions: { "@well-known-js/framework": "2.0.0" },
					tag: "next",
				},
				manifests,
			),
		).toEqual({
			mode: "independent",
			versions: {
				"@well-known-js/core": "1.1.0",
				"@well-known-js/framework": "2.0.0",
			},
			tag: "next",
		});
	});

	it("resolves a grouped release", () => {
		const plan = {
			mode: "grouped" as const,
			version: "1.1.0",
			packages: manifests.map((manifest) => manifest.name),
			tag: "latest",
		};
		const releases = resolveReleasePlan(plan, manifests);
		expect(releases).toEqual([
			{ name: "@well-known-js/core", version: "1.1.0" },
			{ name: "@well-known-js/framework", version: "1.1.0" },
		]);
		expect(githubReleaseGroups(plan, releases)).toMatchObject([{ tag: "v1.1.0" }]);
	});

	it("resolves independent versions and tags", () => {
		const plan = {
			mode: "independent" as const,
			versions: {
				"@well-known-js/core": "1.2.0",
				"@well-known-js/framework": "1.1.0",
			},
			tag: "next",
		};
		const releases = resolveReleasePlan(plan, manifests);
		expect(githubReleaseGroups(plan, releases).map((group) => group.tag)).toEqual([
			"@well-known-js/core@1.2.0",
			"@well-known-js/framework@1.1.0",
		]);
	});

	it("publishes internal dependencies first", () => {
		const releases = [
			{ name: "@well-known-js/framework", version: "1.1.0" },
			{ name: "@well-known-js/core", version: "1.1.0" },
		];
		expect(sortForPublishing(releases, manifests).map((release) => release.name)).toEqual([
			"@well-known-js/core",
			"@well-known-js/framework",
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
				packages: ["@well-known-js/core"],
				tag: "latest",
			},
		],
		[
			"invalid tag",
			{
				mode: "grouped",
				version: "1.0.0",
				packages: ["@well-known-js/core"],
				tag: "invalid tag",
			},
		],
	])("rejects an %s", (_name, plan) => {
		expect(() => resolveReleasePlan(plan as never, manifests)).toThrow();
	});
});
