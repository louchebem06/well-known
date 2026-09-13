import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

interface PackageJson {
	name?: string;
	version?: string;
	private?: boolean;

}

const PACKAGES_DIR = join(process.cwd(), "packages");

function packageExistsOnNpm(name: string): boolean {
	try {
		execFileSync("npm", ["view", name, "version"], {
			stdio: "ignore",
		});

		return true;
	} catch {
		return false;
	}
}

function publishPackage(directory: string, name: string, version: string) {
	console.log(`\n📦 Publishing ${name}@${version}...`);

	try {
		execFileSync("npm", ["publish", "--access", "public"], {
			cwd: directory,
			stdio: "inherit",
		});

		console.log(`✅ Published ${name}@${version}`);
		return true;
	} catch {
		console.error(`❌ Failed to publish ${name}@${version}`);
		return false;
	}
}

function main() {
	const directories = readdirSync(PACKAGES_DIR);

	let published = 0;
	let skipped = 0;

	for (const directory of directories) {
		const packageDirectory = join(PACKAGES_DIR, directory);

		if (!statSync(packageDirectory).isDirectory()) {
			continue;
		}

		const packageJsonPath = join(packageDirectory, "package.json");

		let pkg: PackageJson;

		try {
			pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson;
		} catch {
			continue;
		}

		if (!pkg.name || !pkg.version) {
			continue;
		}

		if (pkg.private) {
			console.log(`⏭️  ${pkg.name}: private package`);
			skipped++;
			continue;
		}

		if (packageExistsOnNpm(pkg.name)) {
			console.log(`⏭️  ${pkg.name}: already exists on npm`);
			skipped++;
			continue;
		}

		const success = publishPackage(packageDirectory, pkg.name, pkg.version);

		if (!success) {
			console.log("\n🛑 Stopping. Retry later to avoid npm rate limiting.");


			process.exit(1);
		}


			process.exit(1);
		}

		published++;
	}

	console.log("\n─────────────────────────────");
	console.log(`Published: ${published}`);
	console.log(`Skipped:   ${skipped}`);
	console.log("─────────────────────────────");

}

main();
