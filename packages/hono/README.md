# @well-known-js/hono

Hono middleware for serving configured `/.well-known/*` routes in Fetch-compatible runtimes.

## Installation

```sh
pnpm add @well-known-js/hono @well-known-js/core hono
```

## Usage

```ts
import { Hono } from "hono";
import { wellKnown } from "@well-known-js/hono";
import config from "./well-known.config.js";

const app = new Hono();
app.use(wellKnown(config));

export default app;
```

Unknown routes continue to the next Hono handler. GET and HEAD responses use each provider's
declared content type.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/hono) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/hono)
