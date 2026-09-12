# @well-known-js/koa

Koa middleware that serves configured `/.well-known/*` routes directly.

## Installation

```sh
pnpm add @well-known-js/koa @well-known-js/core koa
```

## Usage

```ts
import Koa from "koa";
import { wellKnown } from "@well-known-js/koa";
import config from "./well-known.config.js";

const app = new Koa();
app.use(wellKnown(config));
app.listen(3000);
```

GET and HEAD are handled with the provider content type. Other requests continue through the Koa
middleware chain.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/koa) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/koa)
