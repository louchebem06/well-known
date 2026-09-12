# @well-known-js/core

Shared types and configuration helpers for the `@well-known-js` ecosystem.

## Installation

```sh
pnpm add @well-known-js/core
```

## Usage

Create a `well-known.config.ts` file and register one or more providers:

```ts
import { defineConfig } from "@well-known-js/core";
import { assetLinks } from "@well-known-js/assetlinks";

export default defineConfig({
	providers: [
		assetLinks({
			statements: [{ include: "https://example.com/.well-known/assetlinks.json" }],
		}),
	],
});
```

`defineConfig()` validates that provider routes are unique and preserves full TypeScript inference.

## Providers

- [`@well-known-js/apple-app-site-association`](https://www.npmjs.com/package/@well-known-js/apple-app-site-association)
- [`@well-known-js/assetlinks`](https://www.npmjs.com/package/@well-known-js/assetlinks)

[GitHub](https://github.com/louchebem06/well-known) · [Documentation](https://github.com/louchebem06/well-known#readme)
