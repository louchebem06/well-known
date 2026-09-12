import { writeFile } from "node:fs/promises";
import {
	readPackageManifests,
	releasePlanPath,
	readReleasePlan,
	writeJson,
} from "./release-files.js";
import { resolveReleasePlan, type ReleasePlan } from "./release-plan.js";

function planFromEnvironment(packageNames: string[]): ReleasePlan | undefined {
	const mode = process.env.RELEASE_MODE;
	if (!mode) return undefined;
	const tag = process.env.RELEASE_TAG || "latest";
	if (mode === "grouped") {
		const packages =
			process.env.RELEASE_PACKAGES && process.env.RELEASE_PACKAGES !== "all"
				? process.env.RELEASE_PACKAGES.split(",").map((name) => name.trim())
				: packageNames;
		return {
			mode,
			version: process.env.RELEASE_VERSION || "1.0.0",
			packages,
			tag,
		};
	}
	if (mode === "independent") {
		return {
			mode,
			versions: JSON.parse(process.env.RELEASE_VERSIONS || "{}") as Record<string, string>,
			tag,
		};
	}
	throw new Error(`Unknown release mode: ${mode}`);
}

const packages = await readPackageManifests();
const plan =
	planFromEnvironment(packages.map(({ manifest }) => manifest.name)) ?? (await readReleasePlan());
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
