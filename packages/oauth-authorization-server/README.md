# @well-known-js/oauth-authorization-server

Type-safe generator for OAuth 2.0 Authorization Server Metadata defined by RFC 8414.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/oauth-authorization-server
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { oauthAuthorizationServer } from "@well-known-js/oauth-authorization-server";

export default defineConfig({
	providers: [
		oauthAuthorizationServer({
			issuer: "https://id.example.com",
			authorization_endpoint: "https://id.example.com/authorize",
			token_endpoint: "https://id.example.com/token",
			jwks_uri: "https://id.example.com/jwks.json",
			response_types_supported: ["code"],
			grant_types_supported: ["authorization_code"],
			code_challenge_methods_supported: ["S256"],
		}),
	],
});
```

The provider generates `/.well-known/oauth-authorization-server` with
`Content-Type: application/json`. Issuer paths are appended to the metadata endpoint as required by
RFC 8414. For example, issuer `https://id.example.com/tenant/acme` generates
`/.well-known/oauth-authorization-server/tenant/acme`.

Issuer and operational endpoint URLs must use HTTPS. Registered and custom metadata fields are
preserved, including metadata defined by OAuth extensions.

[RFC 8414](https://www.rfc-editor.org/rfc/rfc8414) · [GitHub](https://github.com/louchebem06/well-known/tree/main/packages/oauth-authorization-server)
