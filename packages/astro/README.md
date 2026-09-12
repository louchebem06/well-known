# @well-known-js/astro

Astro integration that generates configured `/.well-known/*` files in the public directory.

## Installation

```sh
pnpm add @well-known-js/astro @well-known-js/core
```

## Usage

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import wellKnown from "@well-known-js/astro";

export default defineConfig({
	integrations: [wellKnown()],
});
```

The integration loads `well-known.config.ts`, uses Astro's configured `publicDir`, and regenerates
files when the configuration changes in development. Pass `{ configFile: "custom.config.ts" }` to
change the configuration path.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/astro) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/astro)
