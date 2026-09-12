# @well-known-js/sbom

Serve a software bill of materials from the permanent
[RFC 9472](https://www.rfc-editor.org/rfc/rfc9472.html) endpoint `/.well-known/sbom`.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/sbom
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { sbom } from "@well-known-js/sbom";

export default defineConfig({
	providers: [
		sbom({
			contentType: "application/spdx+json",
			body: JSON.stringify({
				spdxVersion: "SPDX-2.3",
				SPDXID: "SPDXRef-DOCUMENT",
				name: "example-device",
			}),
		}),
	],
});
```

RFC 9472 intentionally leaves the representation format open and requires clients to inspect the
HTTP `Content-Type`. The provider therefore accepts any syntactically valid media type and preserves
the supplied textual representation verbatim, supporting formats such as SPDX JSON, SPDX tag-value,
CycloneDX JSON, and XML.
