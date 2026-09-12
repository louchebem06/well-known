import { createServer } from "node:http";
import { createWellKnownNodeHandler } from "@well-known/node";
import config from "../well-known.config.js";

const wellKnown = createWellKnownNodeHandler(config);
createServer((request, response) => {
	if (!wellKnown(request, response)) {
		response.statusCode = 404;
		response.end("Not Found");
	}
}).listen(5111);
