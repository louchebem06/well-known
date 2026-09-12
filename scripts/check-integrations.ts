import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
	validateIntegrationCoverage,
	type CoverageManifest,
	type IntegrationConfig,
	type LoadedIntegration,
} from "./integration-coverage.js";

const root = resolve(import.meta.dirname, "..");

async function readJson<T>(path: string): Promise<T> {
	return JSON.parse(await readFile(path, "utf8")) as T;
}

async function loadIntegration(
	definition: CoverageManifest["integrations"][number],
): Promise<LoadedIntegration> {
	const directory = join(root, "examples", definition.example);
	try {
		const packageJson = await readJson<{
			name: string;
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
			peerDependencies?: Record<string, string>;
		}>(join(directory, "package.json"));
		const dependencyNames = new Set([
			...Object.keys(packageJson.dependencies ?? {}),
			...Object.keys(packageJson.devDependencies ?? {}),
			...Object.keys(packageJson.peerDependencies ?? {}),
		]);
		try {
			const module = (await import(
				`${pathToFileURL(join(directory, "well-known.config.ts")).href}?coverage=${Date.now()}`
			)) as { default?: IntegrationConfig };
			return {
				id: definition.id,
				packageName: packageJson.name,
				dependencies: dependencyNames,
				config: module.default,
			};
		} catch (error) {
			return {
				id: definition.id,
				packageName: packageJson.name,
				dependencies: dependencyNames,
				loadError: error instanceof Error ? error.message : String(error),
			};
		}
	} catch (error) {
		return {
			id: definition.id,
			packageName: "",
			dependencies: new Set(),
			loadError: error instanceof Error ? error.message : String(error),
		};
	}
}

const manifest = await readJson<CoverageManifest>(join(root, "well-known.features.json"));
const packageDirectories = await readdir(join(root, "packages"), { withFileTypes: true });
const workspacePackages = new Set<string>();
for (const directory of packageDirectories) {
	if (!directory.isDirectory()) continue;
	const packageJson = await readJson<{ name: string }>(
		join(root, "packages", directory.name, "package.json"),
	);
	workspacePackages.add(packageJson.name);
}

const exampleDirectories = new Set(
	(await readdir(join(root, "examples"), { withFileTypes: true }))
		.filter((directory) => directory.isDirectory())
		.map((directory) => directory.name),
);
const integrations = await Promise.all(manifest.integrations.map(loadIntegration));
for (const example of exampleDirectories) {
	if (!manifest.integrations.some((integration) => integration.example === example)) {
		integrations.push({
			id: example,
			packageName: "",
			dependencies: new Set(),
			loadError: "example is not declared in well-known.features.json",
		});
	}
}

const featureExports = new Map<string, Set<string>>();
for (const feature of manifest.features) {
	try {
		const packageDirectory = feature.package.replace("@well-known/", "");
		const module = (await import(
			pathToFileURL(join(root, "packages", packageDirectory, "dist/index.js")).href
		)) as Record<string, unknown>;
		featureExports.set(feature.package, new Set(Object.keys(module)));
	} catch {
		featureExports.set(feature.package, new Set());
	}
}

const result = validateIntegrationCoverage({
	manifest,
	workspacePackages,
	integrations,
	featureExports,
});

console.table(
	result.cells.map((cell) => ({
		feature: cell.feature,
		integration: cell.integration,
		status: cell.status.toUpperCase(),
		detail: cell.detail,
	})),
);

for (const issue of result.issues) {
	const context = [issue.feature, issue.integration].filter(Boolean).join(" / ");
	const message = `${context ? `${context}: ` : ""}${issue.message}`;
	if (issue.severity === "error") console.error(`ERROR ${message}`);
	else console.warn(`WARN  ${message}`);
}

const passed = result.cells.filter((cell) => cell.status === "pass").length;
const warnings = result.issues.filter((issue) => issue.severity === "warning").length;
const errors = result.issues.filter((issue) => issue.severity === "error").length;
console.log(`Integration coverage: ${passed} passed, ${warnings} warnings, ${errors} errors.`);

if (result.hasErrors) process.exitCode = 1;
