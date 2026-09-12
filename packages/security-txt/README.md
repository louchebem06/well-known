# @well-known-js/security-txt

Type-safe generator for RFC 9116 vulnerability disclosure files.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/security-txt
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { securityTxt } from "@well-known-js/security-txt";

export default defineConfig({
	providers: [
		securityTxt({
			contacts: ["mailto:security@example.com"],
			expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
			canonical: ["https://example.com/.well-known/security.txt"],
			policy: ["https://example.com/security-policy"],
			preferredLanguages: ["en", "fr"],
		}),
	],
});
```

The provider generates `/.well-known/security.txt` with
`Content-Type: text/plain; charset=utf-8`. It validates required contacts, future RFC 3339 expiry,
secure web URLs, language tags, extension fields, and line-injection safety.

[RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) · [GitHub](https://github.com/louchebem06/well-known/tree/main/packages/security-txt)
