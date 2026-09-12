import { createServer } from "node:http";
import { createWellKnownServerHandler } from "@well-known/tanstack-start";
import config from "../well-known.config.js";

const handler = createWellKnownServerHandler(config);
createServer(async (request, response) => {
	const result = handler(
		new Request(`http://${request.headers.host}${request.url}`, { method: request.method }),
	);
	response.statusCode = result.status;
	result.headers.forEach((value, name) => response.setHeader(name, value));
	response.end(Buffer.from(await result.arrayBuffer()));
}).listen(5112);
