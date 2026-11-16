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

## Custom resources

Use `custom()` to serve a resource without a dedicated provider package:

```ts
import { custom, defineConfig } from "@well-known-js/core";

export default defineConfig({
	providers: [
		custom({
			path: "/.well-known/example.json",
			contentType: "application/json",
			body: JSON.stringify({ enabled: true }),
		}),
		custom({
			path: "/.well-known/example.txt",
			contentType: "text/plain; charset=utf-8",
			body: "Hello, world!\n",
		}),
	],
});
```

`CustomOptions` requires `path`, `contentType`, and a string `body`; `name` is optional and defaults
to `"custom"`. The body is preserved as supplied, including whitespace. Serialize JSON with
`JSON.stringify()` before passing it in.

Paths must start with `/.well-known/`. Nested paths are supported; each segment may contain letters,
digits, `.`, `_`, `~`, and `-`, but cannot be `.` or `..`. Empty segments, percent encoding,
backslashes, query strings, and fragments are rejected. Configuration is validated when `custom()`
is called, and `defineConfig()` rejects duplicate paths as with other providers.

Custom providers work with all framework adapters. Static file integrations write the body to the
public directory; server integrations also use the supplied content type for the response.

## Providers

- [`@well-known-js/agent-card`](https://www.npmjs.com/package/@well-known-js/agent-card)
- [`@well-known-js/api-catalog`](https://www.npmjs.com/package/@well-known-js/api-catalog)
- [`@well-known-js/gpc`](https://www.npmjs.com/package/@well-known-js/gpc)
- [`@well-known-js/did-web`](https://www.npmjs.com/package/@well-known-js/did-web)
- [`@well-known-js/did-configuration`](https://www.npmjs.com/package/@well-known-js/did-configuration)
- [`@well-known-js/mta-sts`](https://www.npmjs.com/package/@well-known-js/mta-sts)
- [`@well-known-js/sbom`](https://www.npmjs.com/package/@well-known-js/sbom)
- [`@well-known-js/oauth-authorization-server`](https://www.npmjs.com/package/@well-known-js/oauth-authorization-server)
- [`@well-known-js/oauth-protected-resource`](https://www.npmjs.com/package/@well-known-js/oauth-protected-resource)
- [`@well-known-js/apple-app-site-association`](https://www.npmjs.com/package/@well-known-js/apple-app-site-association)
- [`@well-known-js/assetlinks`](https://www.npmjs.com/package/@well-known-js/assetlinks)
- [`@well-known-js/security-txt`](https://www.npmjs.com/package/@well-known-js/security-txt)
- [`@well-known-js/webauthn`](https://www.npmjs.com/package/@well-known-js/webauthn)
- [`@well-known-js/passkey-endpoints`](https://www.npmjs.com/package/@well-known-js/passkey-endpoints)
- [`@well-known-js/openid-configuration`](https://www.npmjs.com/package/@well-known-js/openid-configuration)

[GitHub](https://github.com/louchebem06/well-known) · [Documentation](https://github.com/louchebem06/well-known#readme)
