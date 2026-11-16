import { afterEach, describe, expect, it, vi } from "vitest";
import { createIssues, normalizeSource, sourceHash } from "./check-standards.js";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe("standards watch", () => {
	it("canonicalizes JSON object keys", () => {
		expect(sourceHash('{"b":2,"a":{"d":4,"c":3}}', "json")).toBe(
			sourceHash('{"a":{"c":3,"d":4},"b":2}', "json"),
		);
	});

	it("ignores HTML scripts, styles, comments, and layout whitespace", () => {
		const first = `
			<html><body><nav>Navigation</nav><main>
				<style>.new { color: red }</style><!-- generated -->
				<h1>Rule</h1><p>A value &amp; another value.</p>
			</main><script>dynamic()</script></body></html>`;
		const second = `<main><h1>Rule</h1> <p>A value &amp; another value.</p></main>`;
		expect(normalizeSource(first, "html")).toBe(normalizeSource(second, "html"));
	});

	it("detects normative text changes", () => {
		expect(sourceHash("Clients MUST redirect.", "text")).not.toBe(
			sourceHash("Clients SHOULD redirect.", "text"),
		);
	});

	it.each([
		["open", "older", "example", false],
		["closed", "current", "example", false],
		["closed", "older", "example", true],
		["open", "older", "example-other", true],
	])(
		"handles a %s issue for the %s revision of %s",
		async (state, revision, id, createsIssue) => {
			vi.stubEnv("GITHUB_TOKEN", "test-token");
			vi.stubEnv("GITHUB_REPOSITORY", "example/standards");
			const request = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
				if (init?.method === "POST") return Response.json({});
				return Response.json([
					{ state, body: `<!-- standards-watch:${id}:${revision} -->` },
				]);
			});
			vi.stubGlobal("fetch", request);
			await createIssues([
				{
					id: "example",
					name: "Example specification",
					package: "@well-known-js/example",
					url: "https://example.com/spec.txt",
					format: "text",
					baseline: "baseline",
					current: "current",
				},
			]);
			const creations = request.mock.calls.filter(
				([url, init]) => url.endsWith("/issues") && init?.method === "POST",
			);
			expect(creations).toHaveLength(createsIssue ? 1 : 0);
		},
	);
});
