# well-known

Type-safe packages for generating or serving files under `/.well-known/` across frontend and server
frameworks.

The project models each well-known file as a provider. Providers validate their configuration and
generate the file body; framework integrations load the configuration and write the result into the
application's public assets directory.

## Packages

| Package                                     | Purpose                                                        |
| ------------------------------------------- | -------------------------------------------------------------- |
| `@well-known-js/core`                       | Provider types and the `defineConfig` helper                   |
| `@well-known-js/apple-app-site-association` | Apple App Site Association provider and schema                 |
| `@well-known-js/assetlinks`                 | Android Digital Asset Links provider and schema                |
| `@well-known-js/security-txt`               | RFC 9116 security.txt provider and schema                      |
| `@well-known-js/webauthn`                   | WebAuthn Related Origin Requests provider and schema           |
| `@well-known-js/passkey-endpoints`          | W3C passkey endpoint discovery provider and schema             |
| `@well-known-js/vite`                       | Framework-agnostic Vite plugin                                 |
| `@well-known-js/sveltekit`                  | SvelteKit adapter using the Vite plugin with `static` defaults |
| `@well-known-js/next`                       | Next.js adapter generating files in `public`                   |
| `@well-known-js/nuxt`                       | Nuxt module generating files in `public`                       |
| `@well-known-js/nestjs`                     | NestJS module exposing well-known routes directly              |
| `@well-known-js/express`                    | Express middleware exposing well-known routes directly         |
| `@well-known-js/tanstack-start`             | TanStack Start server route handlers                           |
| `@well-known-js/fastify`                    | Fastify plugin exposing well-known routes                      |
| `@well-known-js/hono`                       | Hono middleware exposing well-known routes                     |
| `@well-known-js/astro`                      | Astro integration generating public files                      |
| `@well-known-js/react-router`               | React Router resource route loader                             |
| `@well-known-js/angular`                    | Angular SSR server middleware                                  |
| `@well-known-js/solidstart`                 | SolidStart server route handlers                               |
| `@well-known-js/koa`                        | Koa middleware exposing well-known routes                      |
| `@well-known-js/elysia`                     | Elysia plugin exposing well-known routes                       |
| `@well-known-js/adonisjs`                   | AdonisJS middleware exposing well-known routes                 |
| `@well-known-js/node`                       | Native Node.js and Fetch handlers                              |

## Requirements

- Node.js 20 or later
- Vite 5 or later for the Vite integrations
- SvelteKit 2 or later when using `@well-known-js/sveltekit`
- Next.js 15 or later when using `@well-known-js/next`
- Nuxt 3 or later when using `@well-known-js/nuxt`
- NestJS 11 or later when using `@well-known-js/nestjs`
- Express 5 or later when using `@well-known-js/express`

## Run the examples

Install the workspace dependencies, then start every example at once:

```sh
pnpm install
pnpm run dev
```

Each application uses a fixed, unique port. Test its Apple App Site Association response at the
listed URL:

| Integration    | Port | AASA URL                                                       |
| -------------- | ---- | -------------------------------------------------------------- |
| Vite           | 5100 | `http://localhost:5100/.well-known/apple-app-site-association` |
| SvelteKit      | 5101 | `http://localhost:5101/.well-known/apple-app-site-association` |
| Next.js        | 5102 | `http://localhost:5102/.well-known/apple-app-site-association` |
| Nuxt           | 5103 | `http://localhost:5103/.well-known/apple-app-site-association` |
| Astro          | 5104 | `http://localhost:5104/.well-known/apple-app-site-association` |
| Express        | 5105 | `http://localhost:5105/.well-known/apple-app-site-association` |
| NestJS         | 5106 | `http://localhost:5106/.well-known/apple-app-site-association` |
| Fastify        | 5107 | `http://localhost:5107/.well-known/apple-app-site-association` |
| Hono           | 5108 | `http://localhost:5108/.well-known/apple-app-site-association` |
| Koa            | 5109 | `http://localhost:5109/.well-known/apple-app-site-association` |
| Elysia         | 5110 | `http://localhost:5110/.well-known/apple-app-site-association` |
| Node.js        | 5111 | `http://localhost:5111/.well-known/apple-app-site-association` |
| TanStack Start | 5112 | `http://localhost:5112/.well-known/apple-app-site-association` |
| React Router   | 5113 | `http://localhost:5113/.well-known/apple-app-site-association` |
| Angular SSR    | 5114 | `http://localhost:5114/.well-known/apple-app-site-association` |
| SolidStart     | 5115 | `http://localhost:5115/.well-known/apple-app-site-association` |
| AdonisJS       | 5116 | `http://localhost:5116/.well-known/apple-app-site-association` |

## Installation

For a Vite project:

```sh
pnpm add @well-known-js/core @well-known-js/vite
```

Install the providers required by the project. For Apple Universal Links:

```sh
pnpm add @well-known-js/apple-app-site-association
```

For SvelteKit, use the dedicated adapter instead of importing the generic Vite plugin directly:

```sh
pnpm add @well-known-js/core @well-known-js/sveltekit
pnpm add @well-known-js/apple-app-site-association
```

## Configuration

Create `well-known.config.ts` at the project root:

```ts
import { appleAppSiteAssociation } from "@well-known-js/apple-app-site-association";
import { defineConfig } from "@well-known-js/core";

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
import { wellKnown } from "@well-known-js/vite";

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

Use `@well-known-js/sveltekit` alongside the SvelteKit Vite plugin:

```ts
import { sveltekit } from "@sveltejs/kit/vite";
import { wellKnown } from "@well-known-js/sveltekit";
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

## Android Asset Links

Install the Asset Links provider:

```sh
pnpm add @well-known-js/assetlinks
```

Add it to `well-known.config.ts` with the Android package name and SHA-256 certificate
fingerprints:

```ts
import { assetLinks } from "@well-known-js/assetlinks";

assetLinks({
	statements: [
		{
			relation: ["delegate_permission/common.handle_all_urls"],
			target: {
				namespace: "android_app",
				package_name: "com.example.app",
				sha256_cert_fingerprints: [
					"AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA:AA",
				],
			},
		},
	],
});
```

The provider also accepts Web targets and `{ include: "https://..." }` statements. The generated
file is available at:

```text
/.well-known/assetlinks.json
```

## Security.txt

Install the RFC 9116 provider:

```sh
pnpm add @well-known-js/security-txt
```

Add at least one contact and a future expiry date to `well-known.config.ts`:

```ts
import { securityTxt } from "@well-known-js/security-txt";

securityTxt({
	contacts: ["mailto:security@example.com"],
	expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
	canonical: ["https://example.com/.well-known/security.txt"],
	policy: ["https://example.com/security-policy"],
	preferredLanguages: ["en", "fr"],
});
```

The generated RFC 9116 document is served as `text/plain; charset=utf-8` at:

```text
/.well-known/security.txt
```

## WebAuthn related origins

Install the WebAuthn provider:

```sh
pnpm add @well-known-js/webauthn
```

List the HTTPS origins allowed to share credentials with the relying party ID:

```ts
import { webAuthn } from "@well-known-js/webauthn";

webAuthn({
	origins: ["https://example.co.uk", "https://login.example.com"],
});
```

The generated JSON document is available at:

```text
/.well-known/webauthn
```

## Passkey endpoints

Install the passkey endpoint discovery provider:

```sh
pnpm add @well-known-js/passkey-endpoints
```

Advertise direct account workflows for credential managers:

```ts
import { passkeyEndpoints } from "@well-known-js/passkey-endpoints";

passkeyEndpoints({
	enroll: "https://example.com/account/passkeys/create",
	manage: "https://example.com/account/passkeys",
	prfUsageDetails: "https://example.com/help/passkeys",
});
```

The generated JSON document is available at:

```text
/.well-known/passkey-endpoints
```

## Next.js

Install the Next.js adapter and the providers required by the project:

```sh
pnpm add @well-known-js/core @well-known-js/next
pnpm add @well-known-js/apple-app-site-association
```

Create an App Router catch-all route at `app/.well-known/[...path]/route.ts`:

```ts
import { createWellKnownRouteHandlers } from "@well-known-js/next";

import wellKnownConfig from "../../../well-known.config";

export const { GET, HEAD } = createWellKnownRouteHandlers(wellKnownConfig);
```

The handlers serve the provider body directly with its content type and return 404 for an unknown
well-known path. Because the configuration is imported by the route, Next.js tracks it as part of
the application build.

## Nuxt

Install the Nuxt module and the providers required by the project:

```sh
pnpm add @well-known-js/core @well-known-js/nuxt
pnpm add @well-known-js/apple-app-site-association
```

Register the module in `nuxt.config.ts`:

```ts
import wellKnown from "@well-known-js/nuxt";

export default defineNuxtConfig({
	modules: [wellKnown],
});
```

The module reads `well-known.config.ts`, writes generated files to Nuxt's public directory, and
adds their content types to Nitro route rules. Files are regenerated when the configuration changes
during development.

Both paths can be customized through the module configuration:

```ts
export default defineNuxtConfig({
	modules: [wellKnown],
	wellKnown: {
		configFile: "config/well-known.ts",
		publicDir: "public",
	},
});
```

## NestJS

Install the NestJS module and the providers required by the project:

```sh
pnpm add @well-known-js/core @well-known-js/nestjs
pnpm add @well-known-js/apple-app-site-association
```

Import the same well-known configuration directly into the application module:

```ts
import { Module } from "@nestjs/common";
import { WellKnownModule } from "@well-known-js/nestjs";

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

## Express

Install the Express middleware and the providers required by the project:

```sh
pnpm add @well-known-js/core @well-known-js/express
pnpm add @well-known-js/apple-app-site-association
```

Register the middleware before the application's fallback routes:

```ts
import express from "express";
import { wellKnown } from "@well-known-js/express";

import wellKnownConfig from "../well-known.config.js";

const app = express();

app.use(wellKnown(wellKnownConfig));
```

The middleware serves configured `GET` and `HEAD` requests with their provider content types. Other
methods and unknown paths are delegated to the next Express handler.

## Other server integrations

All server integrations consume the same `WellKnownConfig` and preserve provider paths, bodies, and
content types:

| Ecosystem    | Registration API                                   |
| ------------ | -------------------------------------------------- |
| Node.js      | `createWellKnownNodeHandler(config)`               |
| Fetch        | `createWellKnownFetchHandler(config)`              |
| Fastify      | `fastify.register(wellKnown, { config })`          |
| Hono         | `app.use(wellKnown(config))`                       |
| Koa          | `app.use(wellKnown(config))`                       |
| Elysia       | `app.use(wellKnown(config))`                       |
| TanStack     | `createWellKnownServerHandler(config)`             |
| React Router | `createWellKnownLoader(config)`                    |
| SolidStart   | `createWellKnownRouteHandlers(config)`             |
| Angular SSR  | `wellKnown(config)` before the Angular SSR handler |
| AdonisJS     | `registerWellKnownRoutes(router, config)`          |

Astro uses a build integration instead:

```ts
import wellKnown from "@well-known-js/astro";

export default defineConfig({
	integrations: [wellKnown()],
});
```

It generates the configured files in Astro's public directory and regenerates them when the
configuration changes during development.

## Creating a provider

A provider instance declares its destination and returns the generated file:

```ts
import type { WellKnownProviderInstance } from "@well-known-js/core";

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
pnpm check:integrations
pnpm format:check
pnpm lint
```

Every framework adapter has an example under `examples`. Feature and integration coverage is
declared in `well-known.features.json`; ready features must be configured by every example, while
features under development are reported as warnings by `pnpm check:integrations`.

## Releasing packages

The committed `.release/plan.json` is the source of truth for package versions. The initial plan
publishes every package together at `1.0.0`. Later releases can use either strategy:

- `grouped`: selected packages receive one shared version and one GitHub tag such as `v1.1.0`;
- `independent`: each selected package receives its own version and tag such as
  `@well-known-js/core@1.2.0`.

Run the **Prepare release** workflow to create a pull request containing the package version and
lockfile changes. After merging that pull request, run **Publish release** from the `main` branch.
It repeats every workspace check, publishes missing versions to npm in dependency order, and then
creates the corresponding tags and GitHub Releases. Already published versions are skipped so a
partially completed release can be retried safely.

Configure npm Trusted Publishing for the `release-publish.yml` workflow, or add an `NPM_TOKEN`
secret to the `npm` GitHub environment. Protecting that environment with required reviewers is
recommended.

The same preparation can be run locally after editing the release plan:

```sh
pnpm release:prepare
```

The publish commands are intentionally separate and should normally run only in GitHub Actions:

```sh
pnpm release:publish
pnpm release:github
```

## License

[MIT](./LICENSE)
