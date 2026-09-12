# @well-known-js/nuxt

Nuxt module that generates configured `/.well-known/*` files in the public directory.

## Installation

```sh
pnpm add @well-known-js/nuxt @well-known-js/core
```

## Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
	modules: ["@well-known-js/nuxt"],
});
```

Add a `well-known.config.ts` at the Nuxt project root. The module generates all provider files at
startup and watches the configuration during development. Module options support custom
`configFile` and `publicDir` paths.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/nuxt) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/nuxt)
