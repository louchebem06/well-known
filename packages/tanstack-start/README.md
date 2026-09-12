# @well-known-js/tanstack-start

TanStack Start server handler for serving configured `/.well-known/*` routes.

## Installation

```sh
pnpm add @well-known-js/tanstack-start @well-known-js/core
```

## Usage

```ts
import { createWellKnownServerHandler } from "@well-known-js/tanstack-start";
import config from "../../../well-known.config.js";

const handleWellKnown = createWellKnownServerHandler(config);
```

Call the handler from a catch-all server route below `/.well-known`. It accepts a standard
`Request`, returns a standard `Response`, and produces a 404 for unknown provider paths.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/tanstack-start) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/tanstack-start)
