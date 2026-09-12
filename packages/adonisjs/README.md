# @well-known-js/adonisjs

AdonisJS middleware and route registration helpers for configured `/.well-known/*` routes.

## Installation

```sh
pnpm add @well-known-js/adonisjs @well-known-js/core
```

## Usage

```ts
import router from "@adonisjs/core/services/router";
import { registerWellKnownRoutes } from "@well-known-js/adonisjs";
import config from "../well-known.config.js";

registerWellKnownRoutes(router, config);
```

`wellKnown(config)` is also exported for middleware-style integration. Registered routes support
GET and HEAD and use each provider's declared content type.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/adonisjs) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/adonisjs)
