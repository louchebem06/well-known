# @well-known-js/fastify

Fastify plugin that serves configured `/.well-known/*` routes directly.

## Installation

```sh
pnpm add @well-known-js/fastify @well-known-js/core fastify
```

## Usage

```ts
import Fastify from "fastify";
import wellKnown from "@well-known-js/fastify";
import config from "./well-known.config.js";

const app = Fastify();
await app.register(wellKnown, { config });
await app.listen({ port: 3000 });
```

Each provider becomes a Fastify GET route with its declared content type.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/fastify) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/fastify)
