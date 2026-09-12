# @well-known-js/did-configuration

Generate a [DIF DID Configuration](https://identity.foundation/well-known-did-configuration/resources/did-configuration/)
resource at `/.well-known/did-configuration.json`.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/did-configuration
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { didConfiguration } from "@well-known-js/did-configuration";

export default defineConfig({
	providers: [
		didConfiguration({
			"@context": "https://identity.foundation/.well-known/did-configuration/v1",
			linked_dids: ["header.payload.signature"],
		}),
	],
});
```

`linked_dids` accepts compact JWT credentials and Linked Data Proof credentials. Linked Data
credentials are checked for the required contexts and types, matching issuer and subject DIDs, a
valid HTTPS origin, validity dates, and an assertion-method proof. The root resource is strict because
the specification forbids additional members there; credential extensions are preserved.
