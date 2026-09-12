# @well-known-js/gpc

Generate and validate a Global Privacy Control support resource for `/.well-known/gpc.json`.

## Installation

```sh
pnpm add @well-known-js/gpc
```

## Usage

```ts
import { gpc } from "@well-known-js/gpc";

gpc({
	gpc: true,
	lastUpdate: "2026-09-12",
});
```

`lastUpdate` accepts an RFC 3339 full date or date-time. The generated JSON uses
`application/json` at:

```text
/.well-known/gpc.json
```

Unknown members are preserved, as required for forward-compatible consumers.

[Global Privacy Control specification](https://www.w3.org/TR/gpc/) ·
[GitHub](https://github.com/louchebem06/well-known)
