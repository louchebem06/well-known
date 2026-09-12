import { appendFile, writeFile } from "node:fs/promises";
import { detectChangedPackages, findPublishedPackages } from "./release-detection.js";
import {
	readPackageManifests,
	releasePlanPath,
	readReleasePlan,
	writeJson,
} from "./release-files.js";
import {
	resolveReleasePlan,
	suggestReleasePlan,
	type ReleaseBump,
	type ReleaseMode,
	type ReleasePlan,
} from "./release-plan.js";

function parseVersions(value: string | undefined): Record<string, string> {
	const versions: unknown = JSON.parse(value || "{}");
	if (!versions || typeof versions !== "object" || Array.isArray(versions)) {
		throw new Error("Version overrides must be a JSON object.");
	}
	return versions as Record<string, string>;
}

async function planFromEnvironment(
	packages: Awaited<ReturnType<typeof readPackageManifests>>,
): Promise<ReleasePlan | undefined> {
	const mode = process.env.RELEASE_MODE;
	if (!mode) return undefined;
	if (!(["auto", "grouped", "independent"] as string[]).includes(mode)) {
		throw new Error(`Unknown release mode: ${mode}`);
	}
	const bump = process.env.RELEASE_BUMP || "patch";
	if (!(["patch", "minor", "major"] as string[]).includes(bump)) {
		throw new Error(`Unknown release bump: ${bump}`);
	}
	const tag = process.env.RELEASE_TAG || "latest";
	const published = await findPublishedPackages();
	const requestedPackages = process.env.RELEASE_PACKAGES || "auto";
	const packageNames =
		requestedPackages === "auto"
			? await detectChangedPackages(packages, published)
			: requestedPackages === "all"
				? packages
						.filter(({ manifest }) => !manifest.private)
						.map(({ manifest }) => manifest.name)
				: requestedPackages.split(",").map((name) => name.trim());

	return suggestReleasePlan(
		{
			mode: mode as ReleaseMode,
			bump: bump as ReleaseBump,
			packageNames,
			publishedPackageNames: new Set(published.keys()),
			version: process.env.RELEASE_VERSION || undefined,
			versions: parseVersions(process.env.RELEASE_VERSIONS),
			tag,
		},
		packages.map(({ manifest }) => manifest),
	);
}

const packages = await readPackageManifests();
const plan = (await planFromEnvironment(packages)) ?? (await readReleasePlan());
const releases = resolveReleasePlan(
	plan,
	packages.map(({ manifest }) => manifest),
);
const versions = new Map(releases.map((release) => [release.name, release.version]));

for (const entry of packages) {
	const version = versions.get(entry.manifest.name);
	if (!version) continue;
	entry.manifest.version = version;
	await writeJson(entry.path, entry.manifest);
}

await writeFile(releasePlanPath, `${JSON.stringify(plan, null, "\t")}\n`);
console.log(`Prepared ${releases.length} package(s) for release with npm tag ${plan.tag}.`);
console.log(JSON.stringify(plan, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
	await appendFile(
		process.env.GITHUB_STEP_SUMMARY,
		`## Proposed release plan\n\n\`\`\`json\n${JSON.stringify(plan, null, 2)}\n\`\`\`\n`,
	);
}
