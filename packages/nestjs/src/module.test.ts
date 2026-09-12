import "reflect-metadata";

import { Test } from "@nestjs/testing";
import type { WellKnownConfig, WellKnownProviderInstance } from "@well-known/core";
import { describe, expect, it } from "vitest";

import { WellKnownController } from "./controller.js";
import { WellKnownModule } from "./module.js";
import { WellKnownService } from "./service.js";

function provider(
	path: `/.well-known/${string}` = "/.well-known/apple-app-site-association",
): WellKnownProviderInstance {
	return {
		name: "test",
		path,
		generate: () => ({
			path,
			filename: path.split("/").at(-1) ?? "well-known",
			contentType: "application/json",
			body: '{"enabled":true}',
		}),
	};
}

describe("WellKnownModule", () => {
	it("serves configured files with their content type", async () => {
		const service = new WellKnownService({ providers: [provider()] });
		const controller = new WellKnownController(service);
		const response = controller.serve("apple-app-site-association");
		const chunks: Buffer[] = [];

		for await (const chunk of response.getStream()) {
			chunks.push(Buffer.from(chunk));
		}

		expect(response.getHeaders().type).toBe("application/json");
		expect(Buffer.concat(chunks).toString("utf8")).toBe('{"enabled":true}');
	});

	it("supports nested well-known paths and returns 404 for unknown files", async () => {
		const service = new WellKnownService({
			providers: [provider("/.well-known/nested/file")],
		});
		const controller = new WellKnownController(service);

		expect(controller.serve(["nested", "file"]).getHeaders().type).toBe("application/json");
		expect(() => controller.serve("unknown")).toThrow("Not Found");
	});

	it("supports asynchronous configuration", async () => {
		const config: WellKnownConfig = { providers: [provider()] };
		const module = await Test.createTestingModule({
			imports: [
				WellKnownModule.forRootAsync({
					useFactory: async () => config,
				}),
			],
		}).compile();

		expect(module.get(WellKnownService).get("/.well-known/apple-app-site-association")).toEqual(
			expect.objectContaining({ body: '{"enabled":true}' }),
		);
	});

	it("rejects duplicate generated paths", async () => {
		await expect(
			Test.createTestingModule({
				imports: [WellKnownModule.forRoot({ providers: [provider(), provider()] })],
			}).compile(),
		).rejects.toThrow("Duplicate well-known provider path");
	});
});
