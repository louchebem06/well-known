# @well-known-js/react-router

React Router resource-route loader for serving configured `/.well-known/*` routes.

## Installation

```sh
pnpm add @well-known-js/react-router @well-known-js/core react-router
```

## Usage

```ts
import { createWellKnownLoader } from "@well-known-js/react-router";
import config from "../../../well-known.config.js";

export const loader = createWellKnownLoader(config);
```

Mount the loader from a resource route matching `/.well-known/*`. It returns standard Fetch API
responses with the content type declared by each provider and a 404 for unknown paths.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/react-router) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/react-router)
