import { createServer } from "node:http";
import { createWellKnownRouteHandlers } from "@well-known/solidstart";
import config from "../well-known.config.js";

const handlers = createWellKnownRouteHandlers(config);
createServer(async (request, response) => {
	const webRequest = new Request(`http://${request.headers.host}${request.url}`, {
		method: request.method,
	});
	const result = request.method === "HEAD" ? handlers.HEAD(webRequest) : handlers.GET(webRequest);
	response.statusCode = result.status;
	result.headers.forEach((value, name) => response.setHeader(name, value));
	response.end(Buffer.from(await result.arrayBuffer()));
}).listen(5115);
