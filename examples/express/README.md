# Express example

This app exposes Apple App Site Association directly at
`/.well-known/apple-app-site-association` using `@well-known-js/express`.

Run it with `pnpm dev`.

Run `pnpm --filter express-example typecheck` from the repository root to check the example.
This uses TypeScript project references to generate declarations for its workspace dependencies
before checking the application, so a separate package build is not required.
