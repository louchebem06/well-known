import { execFile } from "node:child_process";
import { relative } from "node:path";
import { promisify } from "node:util";
import { gt } from "semver";
import type { ReleasePlan } from "./release-plan.js";
import type { readPackageManifests } from "./release-files.js";
import { repositoryRoot } from "./release-files.js";

const exec = promisify(execFile);

type PackageEntry = Awaited<ReturnType<typeof readPackageManifests>>[number];

export interface PublishedPackage {
	tag: string;
	version: string;
}

function releasesInPlan(plan: ReleasePlan): Array<[string, string]> {
	return plan.mode === "grouped"
		? plan.packages.map((name) => [name, plan.version])
		: Object.entries(plan.versions);
}

export async function findPublishedPackages(): Promise<Map<string, PublishedPackage>> {
	const { stdout } = await exec(
		"git",
		["for-each-ref", "--sort=-creatordate", "--format=%(refname:short)", "refs/tags"],
		{ cwd: repositoryRoot },
	);
	const published = new Map<string, PublishedPackage>();

	for (const tag of stdout.split("\n").filter(Boolean)) {
		let plan: ReleasePlan;
		try {
			const { stdout: contents } = await exec("git", ["show", `${tag}:.release/plan.json`], {
				cwd: repositoryRoot,
			});
			plan = JSON.parse(contents) as ReleasePlan;
		} catch {
			continue;
		}

		for (const [name, version] of releasesInPlan(plan)) {
			const existing = published.get(name);
			if (!existing || gt(version, existing.version)) published.set(name, { tag, version });
		}
	}

	return published;
}

export async function detectChangedPackages(
	packages: PackageEntry[],
	published: ReadonlyMap<string, PublishedPackage>,
): Promise<string[]> {
	const changed: string[] = [];

	for (const entry of packages.filter(({ manifest }) => !manifest.private)) {
		const previousRelease = published.get(entry.manifest.name);
		if (!previousRelease) {
			changed.push(entry.manifest.name);
			continue;
		}

		try {
			await exec(
				"git",
				[
					"diff",
					"--quiet",
					previousRelease.tag,
					"--",
					relative(repositoryRoot, entry.directory),
				],
				{ cwd: repositoryRoot },
			);
		} catch (error) {
			if (typeof error === "object" && error && "code" in error && error.code === 1) {
				changed.push(entry.manifest.name);
				continue;
			}
			throw error;
		}
	}

	return changed.sort();
}
