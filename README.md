# well-known

Type-safe packages for generating or serving files under `/.well-known/` in Vite, SvelteKit,
Next.js, and NestJS projects.

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
| `@well-known/next`                       | Next.js adapter generating files in `public`                   |
| `@well-known/nestjs`                     | NestJS module exposing well-known routes directly              |
| `@well-known/assetlinks`                 | Reserved for Android Asset Links support                       |

## Requirements

- Node.js 20 or later
- Vite 5 or later for the Vite integrations
- SvelteKit 2 or later when using `@well-known/sveltekit`
- Next.js 15 or later when using `@well-known/next`
- NestJS 11 or later when using `@well-known/nestjs`

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

## Next.js

Install the Next.js adapter and the providers required by the project:

```sh
pnpm add @well-known/core @well-known/next
pnpm add @well-known/apple-app-site-association
```

Wrap the Next.js configuration in `next.config.ts`:

```ts
import { withWellKnown } from "@well-known/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default withWellKnown()(nextConfig);
```

The adapter reads `well-known.config.ts` and writes generated files to `public`. It also configures
the providers' content types. During `next dev`, files are regenerated when the well-known
configuration changes.

Both paths can be customized relative to the Next.js project root:

```ts
export default withWellKnown({
	configFile: "config/well-known.ts",
	publicDir: "assets",
})(nextConfig);
```

Changing provider content is supported without restarting the development server. Restart Next.js
after changing the configured provider paths so its header routes can be rebuilt.

## NestJS

Install the NestJS module and the providers required by the project:

```sh
pnpm add @well-known/core @well-known/nestjs
pnpm add @well-known/apple-app-site-association
```

Import the same well-known configuration directly into the application module:

```ts
import { Module } from "@nestjs/common";
import { WellKnownModule } from "@well-known/nestjs";

import wellKnownConfig from "../well-known.config.js";

@Module({
	imports: [WellKnownModule.forRoot(wellKnownConfig)],
})
export class AppModule {}
```

The configured files are exposed directly by NestJS with their provider content types. Asynchronous
configuration is available through `WellKnownModule.forRootAsync(...)`.

If the application uses a global prefix, exclude `/.well-known/*` when configuring that prefix so
the standard URLs remain available at the domain root.

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

Integration examples for SvelteKit, Next.js, and NestJS are available under `examples`. They are
included in the workspace build.

## License

[MIT](./LICENSE)
