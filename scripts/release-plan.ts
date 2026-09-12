import { inc, rcompare, valid } from "semver";

export interface PackageManifest {
	name: string;
	version: string;
	private?: boolean;
	dependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
}

export interface GroupedReleasePlan {
	mode: "grouped";
	version: string;
	packages: string[];
	tag: string;
}

export interface IndependentReleasePlan {
	mode: "independent";
	versions: Record<string, string>;
	tag: string;
}

export type ReleasePlan = GroupedReleasePlan | IndependentReleasePlan;

export type ReleaseMode = ReleasePlan["mode"] | "auto";
export type ReleaseBump = "patch" | "minor" | "major";

export interface ResolvedRelease {
	name: string;
	version: string;
}

export interface ReleasePlanSuggestion {
	mode: ReleaseMode;
	bump: ReleaseBump;
	packageNames: string[];
	publishedPackageNames: ReadonlySet<string>;
	version?: string;
	versions?: Record<string, string>;
	tag: string;
}

const distTagPattern = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

export function suggestReleasePlan(
	options: ReleasePlanSuggestion,
	manifests: PackageManifest[],
): ReleasePlan {
	const manifestsByName = new Map(manifests.map((manifest) => [manifest.name, manifest]));
	const packageNames = [
		...new Set([...options.packageNames, ...Object.keys(options.versions ?? {})]),
	].sort();
	const versions = Object.fromEntries(
		packageNames.map((name) => {
			const manifest = manifestsByName.get(name);
			if (!manifest || manifest.private)
				throw new Error(`Unknown or private package: ${name}`);
			const override = options.versions?.[name];
			if (override) return [name, override];
			if (!options.publishedPackageNames.has(name)) return [name, manifest.version];
			const version = inc(manifest.version, options.bump);
			if (!version)
				throw new Error(`Invalid current version for ${name}: ${manifest.version}`);
			return [name, version];
		}),
	);

	if (options.mode === "grouped" || (options.mode === "auto" && options.version)) {
		const version = options.version || Object.values(versions).sort(rcompare)[0];
		if (!version) throw new Error("A release plan must contain at least one package.");
		return { mode: "grouped", version, packages: packageNames, tag: options.tag };
	}

	const distinctVersions = new Set(Object.values(versions));
	if (options.mode === "auto" && distinctVersions.size === 1) {
		return {
			mode: "grouped",
			version: Object.values(versions)[0]!,
			packages: packageNames,
			tag: options.tag,
		};
	}

	return { mode: "independent", versions, tag: options.tag };
}

export function resolveReleasePlan(
	plan: ReleasePlan,
	manifests: PackageManifest[],
): ResolvedRelease[] {
	if (!distTagPattern.test(plan.tag)) throw new Error(`Invalid npm dist-tag: ${plan.tag}`);
	const publishable = new Map(
		manifests
			.filter((manifest) => !manifest.private)
			.map((manifest) => [manifest.name, manifest]),
	);
	if (plan.mode === "grouped" && new Set(plan.packages).size !== plan.packages.length) {
		throw new Error("A package is listed more than once.");
	}
	const versions =
		plan.mode === "grouped"
			? Object.fromEntries(plan.packages.map((name) => [name, plan.version]))
			: plan.versions;
	const names = Object.keys(versions);

	if (names.length === 0) throw new Error("A release plan must contain at least one package.");
	return names.map((name) => {
		if (!publishable.has(name)) throw new Error(`Unknown or private package: ${name}`);
		const version = versions[name]!;
		if (!valid(version)) throw new Error(`Invalid version for ${name}: ${version}`);
		return { name, version };
	});
}

export function githubReleaseGroups(
	plan: ReleasePlan,
	releases: ResolvedRelease[],
): Array<{ tag: string; title: string; packages: ResolvedRelease[] }> {
	if (plan.mode === "grouped") {
		return [{ tag: `v${plan.version}`, title: `v${plan.version}`, packages: releases }];
	}
	return releases.map((release) => ({
		tag: `${release.name}@${release.version}`,
		title: `${release.name} ${release.version}`,
		packages: [release],
	}));
}

export function sortForPublishing(
	releases: ResolvedRelease[],
	manifests: PackageManifest[],
): ResolvedRelease[] {
	const selected = new Map(releases.map((release) => [release.name, release]));
	const manifestsByName = new Map(manifests.map((manifest) => [manifest.name, manifest]));
	const result: ResolvedRelease[] = [];
	const visiting = new Set<string>();
	const visited = new Set<string>();

	function visit(name: string): void {
		if (visited.has(name)) return;
		if (visiting.has(name)) throw new Error(`Circular package dependency involving ${name}`);
		visiting.add(name);
		const manifest = manifestsByName.get(name);
		const dependencies = {
			...manifest?.dependencies,
			...manifest?.peerDependencies,
			...manifest?.optionalDependencies,
		};
		for (const dependency of Object.keys(dependencies)) {
			if (selected.has(dependency)) visit(dependency);
		}
		visiting.delete(name);
		visited.add(name);
		result.push(selected.get(name)!);
	}

	for (const release of releases) visit(release.name);
	return result;
}
