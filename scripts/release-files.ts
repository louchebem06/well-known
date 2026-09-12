import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { PackageManifest, ReleasePlan } from "./release-plan.js";

export const repositoryRoot = resolve(import.meta.dirname, "..");
export const releasePlanPath = join(repositoryRoot, ".release", "plan.json");

export async function readJson<T>(path: string): Promise<T> {
	return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function readReleasePlan(): Promise<ReleasePlan> {
	return readJson<ReleasePlan>(releasePlanPath);
}

export async function readPackageManifests(): Promise<
	Array<{ path: string; directory: string; manifest: PackageManifest }>
> {
	const packagesDirectory = join(repositoryRoot, "packages");
	const directories = await readdir(packagesDirectory, { withFileTypes: true });
	return Promise.all(
		directories
			.filter((directory) => directory.isDirectory())
			.map(async (directory) => {
				const path = join(packagesDirectory, directory.name, "package.json");
				return {
					path,
					directory: join(packagesDirectory, directory.name),
					manifest: await readJson<PackageManifest>(path),
				};
			}),
	);
}

export async function writeJson(path: string, value: unknown): Promise<void> {
	await writeFile(path, `${JSON.stringify(value, null, "\t")}\n`);
}
