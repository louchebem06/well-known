# @well-known-js/next

Next.js App Router handlers for serving configured `/.well-known/*` routes directly.

## Installation

```sh
pnpm add @well-known-js/next @well-known-js/core
```

## Usage

Create `app/.well-known/[...path]/route.ts`:

```ts
import { createWellKnownRouteHandlers } from "@well-known-js/next";
import config from "../../../well-known.config.js";

export const { GET, HEAD } = createWellKnownRouteHandlers(config);
```

The catch-all route supports every configured provider, including
`/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`.

Requires Next.js 15 or later and Node.js 20 or later.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/next) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/next)
