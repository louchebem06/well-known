import { describe, expect, it } from "vitest";

import { appleAppSiteAssociationSchema } from "./schema.js";

describe("appleAppSiteAssociationSchema", () => {
	it("should reject invalid Apple application identifiers", () => {
		const result = appleAppSiteAssociationSchema.safeParse({
			webcredentials: {
				apps: [""],
			},
		});

		expect(result.success).toBe(false);
	});

	it("should reject unknown properties", () => {
		const result = appleAppSiteAssociationSchema.safeParse({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/products/*",
								unknownProperty: true,
							},
						],
					},
				],
			},
		});

		expect(result.success).toBe(false);
	});
});
