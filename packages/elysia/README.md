# @well-known-js/elysia

Elysia plugin that serves configured `/.well-known/*` routes directly.

## Installation

```sh
pnpm add @well-known-js/elysia @well-known-js/core elysia
```

## Usage

```ts
import { Elysia } from "elysia";
import { wellKnown } from "@well-known-js/elysia";
import config from "./well-known.config.js";

new Elysia().use(wellKnown(config)).listen(3000);
```

Each provider becomes an Elysia GET route returning a standard `Response` with the correct content
type.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/elysia) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/elysia)
