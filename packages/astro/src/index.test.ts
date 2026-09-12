import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { wellKnown } from "./index.js";

describe("wellKnown", () => {
	it("generates files during Astro configuration", async () => {
		const root = await mkdtemp(join(tmpdir(), "well-known-astro-"));
		try {
			await writeFile(
				join(root, "well-known.config.ts"),
				`export default { providers: [{ name: "test", path: "/.well-known/test", generate: () => ({ path: "/.well-known/test", filename: "test", contentType: "text/plain", body: "ok" }) }] };`,
			);
			const setup = wellKnown().hooks["astro:config:setup"] as (options: {
				config: { root: URL; publicDir: URL };
			}) => Promise<void>;
			await setup({
				config: {
					root: pathToFileURL(`${root}/`),
					publicDir: pathToFileURL(`${root}/public/`),
				},
			});
			expect(await readFile(join(root, "public/.well-known/test"), "utf8")).toBe("ok");
		} finally {
			await rm(root, { recursive: true, force: true });
		}
	});
});
