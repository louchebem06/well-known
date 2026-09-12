# @well-known-js/mta-sts

Generate an [RFC 8461 SMTP MTA-STS](https://www.rfc-editor.org/rfc/rfc8461.html) policy at
`/.well-known/mta-sts.txt`.

## Installation

```sh
pnpm add @well-known-js/core @well-known-js/mta-sts
```

## Usage

```ts
import { defineConfig } from "@well-known-js/core";
import { mtaSts } from "@well-known-js/mta-sts";

export default defineConfig({
	providers: [
		mtaSts({
			version: "STSv1",
			mode: "enforce",
			mx: ["mail.example.com", "*.example.net"],
			maxAge: 604_800,
		}),
	],
});
```

The generated policy uses the RFC-required CRLF line endings. `mx` is required in `enforce` and
`testing` modes and optional in `none` mode. `maxAge` is expressed in seconds and capped at the RFC
limit of 31,557,600. Internationalized MX names must be supplied as Punycode A-labels.
