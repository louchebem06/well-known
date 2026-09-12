# @well-known-js/apple-app-site-association

Type-safe Apple App Site Association (AASA) provider for Universal Links, Shared Web Credentials,
and App Clips.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/apple-app-site-association
```

## Usage

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
						components: [{ "/": "/*" }],
					},
				],
			},
		}),
	],
});
```

The provider generates `/.well-known/apple-app-site-association` with
`Content-Type: application/json`. It exports schemas, public TypeScript types, safe validation
helpers, JSON generation, and file generation APIs.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/apple-app-site-association) · [Example](https://github.com/louchebem06/well-known/tree/main/examples)
