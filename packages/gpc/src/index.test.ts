import { describe, expect, it } from "vitest";

import { generateGpc, generateGpcFile, generateGpcJson, gpc, safeGenerateGpc } from "./index.js";

describe("GPC support resource generator", () => {
	it("generates a positive GPC support representation", () => {
		const config = { gpc: true, lastUpdate: "2026-09-12" };
		const file = generateGpcFile(config);
		expect(file).toMatchObject({
			filename: "gpc.json",
			path: "/.well-known/gpc.json",
			contentType: "application/json",
			data: config,
		});
		expect(JSON.parse(file.body)).toEqual(config);
	});

	it("accepts false and a full RFC 3339 date-time", () => {
		expect(
			generateGpc({
				gpc: false,
				lastUpdate: "2026-09-12T14:30:00.123+07:00",
			}),
		).toEqual({ gpc: false, lastUpdate: "2026-09-12T14:30:00.123+07:00" });
	});

	it("preserves unknown members for forward compatibility", () => {
		const config = { gpc: true, lastUpdate: "2026-09-12", policy: "state-laws" };
		expect(generateGpc(config)).toEqual(config);
	});

	it("supports compact JSON and provider instances", () => {
		const config = { gpc: true, lastUpdate: "2026-09-12" };
		const compact = generateGpcJson(config, { pretty: false });
		expect(JSON.parse(compact)).toEqual(config);
		expect(compact).not.toContain("\n");
		expect(gpc(config).generate()).toEqual(generateGpcFile(config));
	});

	it("returns safe validation failures", () => {
		expect(safeGenerateGpc({ gpc: true }).success).toBe(false);
	});

	it.each([
		["a missing gpc member", { lastUpdate: "2026-09-12" }],
		["a non-boolean gpc member", { gpc: "true", lastUpdate: "2026-09-12" }],
		["a missing lastUpdate member", { gpc: true }],
		["a non-calendar date", { gpc: true, lastUpdate: "2026-02-30" }],
		["a date without zero padding", { gpc: true, lastUpdate: "2026-9-2" }],
		["a local date-time", { gpc: true, lastUpdate: "2026-09-12T14:30:00" }],
		["an arbitrary string", { gpc: true, lastUpdate: "yesterday" }],
	])("rejects %s", (_name, input) => expect(() => generateGpcFile(input)).toThrow());
});
