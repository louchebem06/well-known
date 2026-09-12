# @well-known-js/assetlinks

Type-safe Digital Asset Links provider for Android applications, websites, and delegated includes.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/assetlinks
```

## Usage

```ts
import { assetLinks } from "@well-known-js/assetlinks";
import { defineConfig } from "@well-known-js/core";

export default defineConfig({
	providers: [
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
		}),
	],
});
```

The provider generates `/.well-known/assetlinks.json` with `Content-Type: application/json`. Web
targets and `{ include: "https://..." }` statements are also supported.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/assetlinks) · [Examples](https://github.com/louchebem06/well-known/tree/main/examples)
