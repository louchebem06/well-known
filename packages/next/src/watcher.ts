import { watchFile } from "node:fs";
import { resolve } from "node:path";

const watchers = new Set<string>();

export function watchWellKnownConfig(
	root: string,
	configFile: string,
	publicDir: string,
	generate: () => Promise<void>,
): void {
	const configPath = resolve(root, configFile);
	const watcherKey = `${configPath}\0${resolve(root, publicDir)}`;

	if (watchers.has(watcherKey)) {
		return;
	}

	watchers.add(watcherKey);

	let timeout: NodeJS.Timeout | undefined;
	let queue = Promise.resolve();

	watchFile(configPath, { persistent: false, interval: 50 }, (current, previous) => {
		if (current.mtimeMs === previous.mtimeMs && current.size === previous.size) {
			return;
		}

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			queue = queue.then(generate, generate).catch((error: unknown) => {
				console.error(error instanceof Error ? error.message : String(error));
			});
		}, 50);
	});
}
