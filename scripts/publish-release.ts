import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readPackageManifests, readReleasePlan, repositoryRoot } from "./release-files.js";
import { resolveReleasePlan, sortForPublishing } from "./release-plan.js";

const exec = promisify(execFile);
const packages = await readPackageManifests();
const plan = await readReleasePlan();
const manifests = packages.map(({ manifest }) => manifest);
const releases = sortForPublishing(resolveReleasePlan(plan, manifests), manifests);

const { stdout: status } = await exec("git", ["status", "--porcelain"], { cwd: repositoryRoot });
if (status.trim()) throw new Error("Refusing to publish from a dirty Git working tree.");

for (const release of releases) {
	const entry = packages.find(({ manifest }) => manifest.name === release.name)!;
	if (entry.manifest.version !== release.version) {
		throw new Error(
			`${release.name} has version ${entry.manifest.version}, expected ${release.version}.`,
		);
	}

	try {
		await exec("npm", ["view", `${release.name}@${release.version}`, "version"], {
			cwd: repositoryRoot,
		});
		console.log(`Skipping ${release.name}@${release.version}: already published.`);
		continue;
	} catch (error) {
		const stderr =
			typeof error === "object" && error && "stderr" in error ? String(error.stderr) : "";
		if (!stderr.includes("E404") && !stderr.includes("404")) throw error;
	}

	console.log(`Publishing ${release.name}@${release.version} with tag ${plan.tag}...`);
	await exec(
		"pnpm",
		["publish", "--access", "public", "--tag", plan.tag, "--no-git-checks", "--provenance"],
		{ cwd: entry.directory },
	);
}
