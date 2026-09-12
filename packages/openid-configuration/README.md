# @well-known-js/openid-configuration

Type-safe generator for OpenID Connect Discovery 1.0 provider metadata.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/openid-configuration
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { openIdConfiguration } from "@well-known-js/openid-configuration";

export default defineConfig({
	providers: [
		openIdConfiguration({
			issuer: "https://id.example.com",
			authorization_endpoint: "https://id.example.com/authorize",
			token_endpoint: "https://id.example.com/token",
			jwks_uri: "https://id.example.com/jwks",
			response_types_supported: ["code"],
			subject_types_supported: ["public"],
			id_token_signing_alg_values_supported: ["RS256"],
		}),
	],
});
```

The provider generates `/.well-known/openid-configuration` with `Content-Type: application/json`.
Registered and custom metadata fields are preserved. It also exports its Zod schema, public
TypeScript types, safe validation helper, and JSON and file generation functions.

[OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) · [GitHub](https://github.com/louchebem06/well-known/tree/main/packages/openid-configuration)
