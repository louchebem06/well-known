import { createServer } from "node:http";
import { createWellKnownLoader } from "@well-known/react-router";
import config from "../well-known.config.js";

const loader = createWellKnownLoader(config);
createServer(async (request, response) => {
	const result = loader({
		request: new Request(`http://${request.headers.host}${request.url}`, {
			method: request.method,
		}),
	});
	response.statusCode = result.status;
	result.headers.forEach((value, name) => response.setHeader(name, value));
	response.end(Buffer.from(await result.arrayBuffer()));
}).listen(5113);
