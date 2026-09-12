# @well-known-js/nestjs

NestJS module and controller for serving configured `/.well-known/*` routes directly.

## Installation

```sh
pnpm add @well-known-js/nestjs @well-known-js/core @nestjs/common
```

## Usage

```ts
import { Module } from "@nestjs/common";
import { WellKnownModule } from "@well-known-js/nestjs";
import config from "../well-known.config.js";

@Module({
	imports: [WellKnownModule.forRoot(config)],
})
export class AppModule {}
```

`WellKnownModule.forRootAsync()` is available for dependency-injected configuration. The module
serves GET and HEAD requests with the content type declared by each provider.

[GitHub](https://github.com/louchebem06/well-known/tree/main/packages/nestjs) · [Example](https://github.com/louchebem06/well-known/tree/main/examples/nestjs)
