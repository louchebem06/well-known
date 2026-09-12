# @well-known-js/node

Framework-independent Node.js and Fetch API handlers for serving `/.well-known/*` routes.

## Installation

```sh
pnpm add @well-known-js/node @well-known-js/core
```

## Node.js HTTP server

```ts
import { createServer } from "node:http";
import { createWellKnownNodeHandler } from "@well-known-js/node";
import config from "./well-known.config.js";

const wellKnown = createWellKnownNodeHandler(config);

createServer((request, response) => {
	if (!wellKnown(request, response)) {
		response.statusCode = 404;
		response.end("Not Found");
	}
}).listen(3000);
```

Use `createWellKnownFetchHandler(config)` in runtimes that accept standard `Request` and `Response`
objects. `WellKnownRegistry` is also exported for custom adapters. GET and HEAD are supported.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/node) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/node)
