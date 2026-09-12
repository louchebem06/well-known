import { describe, expect, it } from "vitest";
import { normalizeSource, sourceHash } from "./check-standards.js";

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
});
