# @well-known-js/angular

Middleware for serving configured `/.well-known/*` routes from an Angular SSR server.

## Installation

```sh
pnpm add @well-known-js/angular @well-known-js/core
```

## Usage

```ts
import { wellKnown } from "@well-known-js/angular";
import config from "./well-known.config.js";

const middleware = wellKnown(config);

// Register before the Angular SSR fallback:
server.use(middleware);
```

The middleware works with Node.js `IncomingMessage` and `ServerResponse`, handles GET and HEAD, and
calls `next()` for unknown routes.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/angular) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/angular)
