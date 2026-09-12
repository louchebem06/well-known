# @well-known-js/did-web

Generate a DID document for a root [`did:web`](https://w3c-ccg.github.io/did-method-web/)
identifier at `/.well-known/did.json`.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/did-web
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { didWeb } from "@well-known-js/did-web";

export default defineConfig({
	providers: [
		didWeb({
			"@context": "https://www.w3.org/ns/did/v1",
			id: "did:web:example.com",
			verificationMethod: [
				{
					id: "did:web:example.com#owner",
					type: "Multikey",
					controller: "did:web:example.com",
					publicKeyMultibase: "z6Mk...",
				},
			],
			authentication: ["did:web:example.com#owner"],
		}),
	],
});
```

The fixed well-known path represents only a bare-domain `did:web` identifier. Path-based identifiers
such as `did:web:example.com:users:alice` resolve to `/users/alice/did.json` and are intentionally
rejected by this provider. Ports are supported when the colon is encoded, for example
`did:web:example.com%3A8443`.

The schema covers DID Core controllers, verification methods, verification relationships, services,
and JSON-LD contexts. Extension properties are preserved.
