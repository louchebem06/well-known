# well-known

Type-safe packages for generating files served from `/.well-known/` in Vite and SvelteKit projects.

The project models each well-known file as a provider. Providers validate their configuration and
generate the file body; framework integrations load the configuration and write the result into the
application's public assets directory.

## Packages

| Package                                  | Purpose                                                        |
| ---------------------------------------- | -------------------------------------------------------------- |
| `@well-known/core`                       | Provider types and the `defineConfig` helper                   |
| `@well-known/apple-app-site-association` | Apple App Site Association provider and schema                 |
| `@well-known/vite`                       | Framework-agnostic Vite plugin                                 |
| `@well-known/sveltekit`                  | SvelteKit adapter using the Vite plugin with `static` defaults |
| `@well-known/assetlinks`                 | Reserved for Android Asset Links support                       |

## Requirements

- Node.js 20 or later
- Vite 5 or later for the Vite integrations
- SvelteKit 2 or later when using `@well-known/sveltekit`

## Installation

For a Vite project:

```sh
pnpm add @well-known/core @well-known/vite
```

Install the providers required by the project. For Apple Universal Links:

```sh
pnpm add @well-known/apple-app-site-association
```

For SvelteKit, use the dedicated adapter instead of importing the generic Vite plugin directly:

```sh
pnpm add @well-known/core @well-known/sveltekit
pnpm add @well-known/apple-app-site-association
```

## Configuration

Create `well-known.config.ts` at the project root:

```ts
import { appleAppSiteAssociation } from "@well-known/apple-app-site-association";
import { defineConfig } from "@well-known/core";

export default defineConfig({
	providers: [
		appleAppSiteAssociation({
			applinks: {
				details: [
					{
						appIDs: ["ABCDE12345.com.example.app"],
						components: [
							{
								"/": "/*",
							},
						],
					},
				],
			},
		}),
	],
});
```

`defineConfig` also prevents two providers from targeting the same well-known path.

## Vite

Add the plugin to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import { wellKnown } from "@well-known/vite";

export default defineConfig({
	plugins: [wellKnown()],
});
```

By default, files are written to Vite's resolved `publicDir`. The plugin regenerates them when
`well-known.config.ts` changes during development.

Options can override both paths:

```ts
wellKnown({
	configFile: "config/well-known.ts",
	outputDir: "public",
});
```

Both paths are resolved from the Vite project root.

## SvelteKit

Use `@well-known/sveltekit` alongside the SvelteKit Vite plugin:

```ts
import { sveltekit } from "@sveltejs/kit/vite";
import { wellKnown } from "@well-known/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [wellKnown(), sveltekit()],
});
```

The adapter writes generated files to `static` by default. A custom SvelteKit assets directory can
be supplied with `staticDir`:

```ts
wellKnown({
	configFile: "well-known.config.ts",
	staticDir: "assets",
});
```

With the AASA provider, the generated file is available at:

```text
/.well-known/apple-app-site-association
```

## Creating a provider

A provider instance declares its destination and returns the generated file:

```ts
import type { WellKnownProviderInstance } from "@well-known/core";

export function exampleProvider(): WellKnownProviderInstance {
	return {
		name: "example",
		path: "/.well-known/example",
		generate() {
			return {
				path: "/.well-known/example",
				filename: "example",
				contentType: "application/json",
				body: JSON.stringify({ enabled: true }),
			};
		},
	};
}
```

Add the returned instance to the `providers` array in `well-known.config.ts`.

## Development

This repository uses pnpm workspaces:

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
pnpm lint
```

The SvelteKit example is located in `examples/sveltekit` and is included in the workspace build.

## License

[MIT](./LICENSE)
