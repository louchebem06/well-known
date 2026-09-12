import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { repositoryRoot } from "./release-files.js";

export type SourceFormat = "html" | "json" | "text";

export interface StandardsSource {
	id: string;
	name: string;
	package: string;
	url: string;
	format: SourceFormat;
	baseline: string;
}

interface SourceResult extends StandardsSource {
	current: string;
}

const configPath = join(repositoryRoot, "standards-watch.json");
const issueLabel = "standards-watch";

function stableJson(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(stableJson);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(
		Object.entries(value)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, child]) => [key, stableJson(child)]),
	);
}

function decodeHtml(value: string): string {
	return value
		.replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&#x([\da-f]+);/gi, (_match, code: string) =>
			String.fromCodePoint(Number.parseInt(code, 16)),
		)
		.replaceAll("&nbsp;", " ")
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'");
}

export function normalizeSource(contents: string, format: SourceFormat): string {
	if (format === "json") return JSON.stringify(stableJson(JSON.parse(contents)));
	if (format === "text") {
		return contents
			.replaceAll("\r\n", "\n")
			.split("\n")
			.map((line) => line.trimEnd())
			.join("\n")
			.trim();
	}

	const withoutAssets = contents
		.replace(/<(script|style|template|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
		.replace(/<!--([\s\S]*?)-->/g, " ");
	const relevant =
		withoutAssets.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
		withoutAssets.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ??
		withoutAssets.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ??
		withoutAssets;
	return decodeHtml(relevant.replace(/<[^>]+>/g, " "))
		.replace(/\s+/g, " ")
		.trim();
}

export function sourceHash(contents: string, format: SourceFormat): string {
	return createHash("sha256").update(normalizeSource(contents, format)).digest("hex");
}

async function inspectSource(source: StandardsSource): Promise<SourceResult> {
	let lastError: unknown;
	for (let attempt = 0; attempt < 4; attempt += 1) {
		try {
			const response = await fetch(source.url, {
				headers: { "user-agent": "well-known-js-standards-watch/1.0" },
				redirect: "follow",
				signal: AbortSignal.timeout(30_000),
			});
			if (!response.ok) {
				throw new Error(`${source.name}: HTTP ${response.status} for ${source.url}`);
			}
			return { ...source, current: sourceHash(await response.text(), source.format) };
		} catch (error) {
			lastError = error;
			if (attempt < 3) {
				await new Promise((resolve) => setTimeout(resolve, 1_000 * 2 ** attempt));
			}
		}
	}
	throw lastError;
}

async function githubRequest(path: string, init: RequestInit = {}): Promise<Response> {
	const token = process.env.GITHUB_TOKEN;
	if (!token) throw new Error("GITHUB_TOKEN is required to create standards-watch issues.");
	const response = await fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			accept: "application/vnd.github+json",
			authorization: `Bearer ${token}`,
			"content-type": "application/json",
			"user-agent": "well-known-js-standards-watch/1.0",
			"x-github-api-version": "2022-11-28",
			...init.headers,
		},
	});
	if (!response.ok) throw new Error(`GitHub API ${path}: HTTP ${response.status}`);
	return response;
}

async function createIssues(changes: SourceResult[]): Promise<void> {
	const repository = process.env.GITHUB_REPOSITORY;
	if (!repository)
		throw new Error("GITHUB_REPOSITORY is required to create standards-watch issues.");
	const [owner, name] = repository.split("/");
	if (!owner || !name) throw new Error(`Invalid GITHUB_REPOSITORY: ${repository}`);

	try {
		await githubRequest(`/repos/${owner}/${name}/labels`, {
			method: "POST",
			body: JSON.stringify({
				name: issueLabel,
				color: "5319e7",
				description: "Upstream specification or platform documentation changed",
			}),
		});
	} catch (error) {
		if (!(error instanceof Error) || !error.message.includes("HTTP 422")) throw error;
	}

	const existing: Array<{ body?: string }> = [];
	for (let page = 1; ; page += 1) {
		const response = await githubRequest(
			`/repos/${owner}/${name}/issues?state=all&labels=${issueLabel}&per_page=100&page=${page}`,
		);
		const issues = (await response.json()) as Array<{ body?: string }>;
		existing.push(...issues);
		if (issues.length < 100) break;
	}

	for (const change of changes) {
		const marker = `<!-- standards-watch:${change.id}:${change.current} -->`;
		if (existing.some((issue) => issue.body?.includes(marker))) {
			console.log(`Issue already recorded for ${change.id}@${change.current}.`);
			continue;
		}
		const body = `${marker}
## Upstream change detected

- **Package:** \`${change.package}\`
- **Source:** [${change.name}](${change.url})
- **Previous fingerprint:** \`${change.baseline}\`
- **Current fingerprint:** \`${change.current}\`

Review the upstream changes against the provider schema, validation rules, serialization, tests, and documentation. If no implementation change is needed, document why before closing this issue. After review, run \`pnpm standards:refresh\` and commit the updated baseline.`;
		await githubRequest(`/repos/${owner}/${name}/issues`, {
			method: "POST",
			body: JSON.stringify({
				title: `[Standards watch] ${change.name} changed`,
				body,
				labels: [issueLabel],
			}),
		});
		console.log(`Created an issue for ${change.name}.`);
	}
}

async function main(): Promise<void> {
	const sources = JSON.parse(await readFile(configPath, "utf8")) as StandardsSource[];
	const results = await Promise.all(sources.map(inspectSource));

	if (process.argv.includes("--refresh")) {
		await writeFile(
			configPath,
			`${JSON.stringify(
				results.map(({ current, ...source }) => ({ ...source, baseline: current })),
				null,
				"\t",
			)}\n`,
		);
		console.log(`Refreshed ${results.length} standards-watch baseline(s).`);
		return;
	}

	const changes = results.filter(({ baseline, current }) => baseline !== current);
	if (changes.length === 0) {
		console.log(`Checked ${results.length} upstream sources; no changes detected.`);
		return;
	}
	if (changes.some(({ baseline }) => !baseline)) {
		throw new Error("A standards-watch baseline is missing. Run pnpm standards:refresh.");
	}
	console.table(
		changes.map(({ id, package: packageName, baseline, current }) => ({
			id,
			package: packageName,
			baseline,
			current,
		})),
	);
	await createIssues(changes);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
