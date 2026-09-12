# @well-known-js/vite

Vite plugin that generates configured `/.well-known/*` files and regenerates them during
development.

## Installation

```sh
pnpm add -D @well-known-js/vite
pnpm add @well-known-js/core
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { wellKnown } from "@well-known-js/vite";

export default defineConfig({
	plugins: [wellKnown()],
});
```

By default the plugin loads `well-known.config.ts` and writes generated files to Vite's
`publicDir`. Use `wellKnown({ configFile, outputDir })` for custom paths. Configuration changes are
watched in development.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/vite) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/vite)
