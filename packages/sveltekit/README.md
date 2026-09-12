# @well-known-js/sveltekit

SvelteKit integration for generating configured `/.well-known/*` files.

## Installation

```sh
pnpm add -D @well-known-js/sveltekit
pnpm add @well-known-js/core
```

## Usage

```ts
// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { wellKnown } from "@well-known-js/sveltekit";

export default defineConfig({
	plugins: [wellKnown(), sveltekit()],
});
```

The integration loads `well-known.config.ts`, writes files to `static` by default, and regenerates
them when the configuration changes. Use `wellKnown({ configFile, staticDir })` for custom paths.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/sveltekit) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/sveltekit)
