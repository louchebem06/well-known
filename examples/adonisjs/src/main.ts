import { createServer } from "node:http";
import type { AdonisHttpContext, AdonisRouter } from "@well-known/adonisjs";
import { registerWellKnownRoutes } from "@well-known/adonisjs";
import config from "../well-known.config.js";

const routes = new Map<string, (context: AdonisHttpContext) => unknown>();
const router: AdonisRouter = {
	get: (path, handler) => routes.set(`GET ${path}`, handler),
	head: (path, handler) => routes.set(`HEAD ${path}`, handler),
};
registerWellKnownRoutes(router, config);

createServer((request, response) => {
	const path = new URL(request.url ?? "/", "http://localhost").pathname;
	const route = routes.get(`${request.method} ${path}`);
	if (!route) {
		response.statusCode = 404;
		response.end("Not Found");
		return;
	}
	route({
		request: { method: () => request.method ?? "GET", url: () => path },
		response: {
			header: (name, value) => response.setHeader(name, value),
			send: (body) => response.end(body),
		},
	});
}).listen(5116);
