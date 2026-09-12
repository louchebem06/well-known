import { createServer } from "node:http";
import { wellKnown } from "@well-known/angular";
import config from "../well-known.config.js";

const middleware = wellKnown(config);
createServer((request, response) => {
	middleware(request, response, () => {
		response.statusCode = 404;
		response.end("Angular SSR fallback");
	});
}).listen(5114);
