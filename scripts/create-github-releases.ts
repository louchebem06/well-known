import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readPackageManifests, readReleasePlan, repositoryRoot } from "./release-files.js";
import { githubReleaseGroups, resolveReleasePlan } from "./release-plan.js";

const exec = promisify(execFile);
const plan = await readReleasePlan();
const packages = await readPackageManifests();
const releases = resolveReleasePlan(
	plan,
	packages.map(({ manifest }) => manifest),
);

for (const group of githubReleaseGroups(plan, releases)) {
	try {
		await exec("git", ["rev-parse", group.tag], { cwd: repositoryRoot });
	} catch {
		await exec("git", ["tag", "-a", group.tag, "-m", group.title], { cwd: repositoryRoot });
		await exec("git", ["push", "origin", group.tag], { cwd: repositoryRoot });
	}

	try {
		await exec("gh", ["release", "view", group.tag], { cwd: repositoryRoot });
		console.log(`GitHub Release ${group.tag} already exists.`);
	} catch {
		await exec(
			"gh",
			[
				"release",
				"create",
				group.tag,
				"--title",
				group.title,
				"--generate-notes",
				"--verify-tag",
			],
			{ cwd: repositoryRoot },
		);
	}
}
