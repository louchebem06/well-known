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

The package also exports the contracts used to create providers and framework adapters:

- `WellKnownConfig` describes the shared configuration object;
- `WellKnownProvider<TConfig>` describes a reusable provider definition;
- `WellKnownProviderInstance` describes a configured provider;
- `WellKnownGeneratedFile` describes the generated path, filename, content type, and body.

## Providers

- [`@well-known-js/agent-card`](https://www.npmjs.com/package/@well-known-js/agent-card)
- [`@well-known-js/api-catalog`](https://www.npmjs.com/package/@well-known-js/api-catalog)
- [`@well-known-js/gpc`](https://www.npmjs.com/package/@well-known-js/gpc)
- [`@well-known-js/did-web`](https://www.npmjs.com/package/@well-known-js/did-web)
- [`@well-known-js/oauth-authorization-server`](https://www.npmjs.com/package/@well-known-js/oauth-authorization-server)
- [`@well-known-js/oauth-protected-resource`](https://www.npmjs.com/package/@well-known-js/oauth-protected-resource)
- [`@well-known-js/apple-app-site-association`](https://www.npmjs.com/package/@well-known-js/apple-app-site-association)
- [`@well-known-js/assetlinks`](https://www.npmjs.com/package/@well-known-js/assetlinks)
- [`@well-known-js/security-txt`](https://www.npmjs.com/package/@well-known-js/security-txt)
- [`@well-known-js/webauthn`](https://www.npmjs.com/package/@well-known-js/webauthn)
- [`@well-known-js/passkey-endpoints`](https://www.npmjs.com/package/@well-known-js/passkey-endpoints)
- [`@well-known-js/openid-configuration`](https://www.npmjs.com/package/@well-known-js/openid-configuration)

[GitHub](https://github.com/louchebem06/well-known) · [Documentation](https://github.com/louchebem06/well-known#readme)
