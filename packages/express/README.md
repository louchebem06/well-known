# @well-known-js/express

Express middleware that serves configured `/.well-known/*` routes directly.

## Installation

```sh
pnpm add @well-known-js/express @well-known-js/core express
```

## Usage

```ts
import express from "express";
import { wellKnown } from "@well-known-js/express";
import config from "./well-known.config.js";

const app = express();
app.use(wellKnown(config));
app.listen(3000);
```

The middleware handles GET and HEAD, applies each provider's `Content-Type`, and delegates unknown
routes to the next Express middleware.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/express) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/express)
