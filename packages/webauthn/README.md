# @well-known-js/webauthn

Type-safe generator for the WebAuthn Related Origin Requests discovery document.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/webauthn
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { webAuthn } from "@well-known-js/webauthn";

export default defineConfig({
	providers: [
		webAuthn({
			origins: ["https://example.co.uk", "https://login.example.com"],
		}),
	],
});
```

The provider generates `/.well-known/webauthn` with `Content-Type: application/json`.

[WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/#sctn-related-origins) · [GitHub](https://github.com/louchebem06/well-known/tree/main/packages/webauthn)
