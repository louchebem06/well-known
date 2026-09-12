# @well-known-js/oauth-protected-resource

Type-safe generator for OAuth 2.0 Protected Resource Metadata defined by RFC 9728.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/oauth-protected-resource
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { oauthProtectedResource } from "@well-known-js/oauth-protected-resource";

export default defineConfig({
	providers: [
		oauthProtectedResource({
			resource: "https://api.example.com",
			authorization_servers: ["https://id.example.com"],
			scopes_supported: ["read", "write"],
			bearer_methods_supported: ["header"],
			resource_documentation: "https://api.example.com/docs",
		}),
	],
});
```

The provider generates `/.well-known/oauth-protected-resource` with
`Content-Type: application/json`. When `resource` contains a path, the same path is appended to the
metadata endpoint as required by RFC 9728. For example, `https://api.example.com/public/mcp`
generates `/.well-known/oauth-protected-resource/public/mcp`.

Resource identifiers must use HTTPS and must not contain fragments. Non-root resource paths must
not end with a slash so the document can be generated consistently by both static-file and server
adapters. Registered and custom metadata fields are preserved.

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) · [GitHub](https://github.com/louchebem06/well-known/tree/main/packages/oauth-protected-resource)
