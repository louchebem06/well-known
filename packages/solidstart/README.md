# @well-known-js/solidstart

SolidStart server-route handlers for serving configured `/.well-known/*` routes.

## Installation

```sh
pnpm add @well-known-js/solidstart @well-known-js/core
```

## Usage

```ts
import { createWellKnownRouteHandlers } from "@well-known-js/solidstart";
import config from "../../../well-known.config.js";

export const { GET, HEAD } = createWellKnownRouteHandlers(config);
```

Mount the handlers from a catch-all server route below `/.well-known`. Responses use standard
Fetch API objects and provider-defined content types.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/solidstart) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/solidstart)
