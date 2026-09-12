# @well-known-js/api-catalog

Generate and validate API Catalog documents for `/.well-known/api-catalog` according to RFC 9727
and the RFC 9264 JSON Linkset format.

## Installation

```sh
pnpm add @well-known-js/api-catalog
```

## Usage

```ts
import { apiCatalog } from "@well-known-js/api-catalog";

apiCatalog({
	linkset: [
		{
			anchor: "https://developer.example.com/apis/payments",
			"service-desc": [
				{
					href: "https://developer.example.com/apis/payments/openapi.yaml",
					type: "application/yaml",
				},
			],
			"service-doc": [
				{
					href: "https://developer.example.com/apis/payments/docs",
					type: "text/html",
				},
			],
		},
	],
});
```

The generated response uses RFC 9727's recommended profile:

```text
Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"
```

It is available at:

```text
/.well-known/api-catalog
```

[RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) ·
[RFC 9264](https://www.rfc-editor.org/rfc/rfc9264) ·
[GitHub](https://github.com/louchebem06/well-known)
