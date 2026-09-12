# @well-known-js/passkey-endpoints

Type-safe generator for the W3C Relying Party Passkey Endpoints discovery document.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/passkey-endpoints
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { passkeyEndpoints } from "@well-known-js/passkey-endpoints";

export default defineConfig({
	providers: [
		passkeyEndpoints({
			enroll: "https://example.com/account/passkeys/create",
			manage: "https://example.com/account/passkeys",
			prfUsageDetails: "https://example.com/help/passkeys",
		}),
	],
});
```

The provider generates `/.well-known/passkey-endpoints` with `Content-Type: application/json`.
An empty object is also valid and advertises passkey support without specific endpoints.

[W3C specification](https://www.w3.org/TR/passkey-endpoints/) · [GitHub](https://github.com/louchebem06/well-known/tree/main/packages/passkey-endpoints)
