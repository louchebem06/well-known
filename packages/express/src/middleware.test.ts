import type { NextFunction, Request, Response } from "express";
import type { WellKnownConfig, WellKnownProviderInstance } from "@well-known/core";
import { describe, expect, it, vi } from "vitest";

import { wellKnown } from "./middleware.js";

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

function request(method: string, path: string): Request {
	return { method, path } as Request;
}

function response() {
	const send = vi.fn();
	const type = vi.fn(() => ({ send }));

	return {
		response: { type } as unknown as Response,
		send,
		type,
	};
}

describe("wellKnown", () => {
	it("serves configured GET and HEAD requests with the provider content type", () => {
		const middleware = wellKnown({ providers: [provider()] });
		const next = vi.fn() as NextFunction;
		const getResponse = response();
		const headResponse = response();

		middleware(
			request("GET", "/.well-known/apple-app-site-association"),
			getResponse.response,
			next,
		);
		middleware(
			request("HEAD", "/.well-known/apple-app-site-association"),
			headResponse.response,
			next,
		);

		expect(getResponse.type).toHaveBeenCalledWith("application/json");
		expect(getResponse.send).toHaveBeenCalledWith('{"enabled":true}');
		expect(headResponse.send).toHaveBeenCalledWith('{"enabled":true}');
		expect(next).not.toHaveBeenCalled();
	});

	it("supports nested paths and delegates unknown routes and methods", () => {
		const middleware = wellKnown({ providers: [provider("/.well-known/nested/file")] });
		const next = vi.fn() as NextFunction;
		const matchedResponse = response();

		middleware(request("GET", "/.well-known/nested/file"), matchedResponse.response, next);
		middleware(request("GET", "/.well-known/unknown"), response().response, next);
		middleware(request("POST", "/.well-known/nested/file"), response().response, next);

		expect(matchedResponse.send).toHaveBeenCalledWith('{"enabled":true}');
		expect(next).toHaveBeenCalledTimes(2);
	});

	it("generates providers once when the middleware is created", () => {
		const generate = vi.fn(provider().generate);
		const config: WellKnownConfig = {
			providers: [{ ...provider(), generate }],
		};
		const middleware = wellKnown(config);

		middleware(
			request("GET", "/.well-known/apple-app-site-association"),
			response().response,
			vi.fn(),
		);
		middleware(
			request("GET", "/.well-known/apple-app-site-association"),
			response().response,
			vi.fn(),
		);

		expect(generate).toHaveBeenCalledOnce();
	});

	it("rejects duplicate generated paths", () => {
		expect(() => wellKnown({ providers: [provider(), provider()] })).toThrow(
			"Duplicate well-known provider path",
		);
	});
});
