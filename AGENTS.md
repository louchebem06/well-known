# Repository guidelines

## Project overview

This repository is a pnpm workspace for generating files served from `/.well-known/`.

The workspace is split into small, framework-agnostic packages:

- `packages/core`: shared provider contracts and `defineConfig`.
- `packages/agent-card`: Agent2Agent Agent Card provider and schema.
- `packages/api-catalog`: RFC 9727 API Catalog Linkset provider and schema.
- `packages/gpc`: Global Privacy Control support resource provider and schema.
- `packages/apple-app-site-association`: Apple App Site Association provider and schema.
- `packages/assetlinks`: Android Digital Asset Links provider and schema.
- `packages/security-txt`: RFC 9116 security.txt provider and schema.
- `packages/webauthn`: WebAuthn Related Origin Requests provider and schema.
- `packages/passkey-endpoints`: W3C passkey endpoint discovery provider and schema.
- `packages/openid-configuration`: OpenID Connect Discovery metadata provider and schema.
- `packages/oauth-authorization-server`: OAuth 2.0 Authorization Server Metadata provider and schema.
- `packages/oauth-protected-resource`: OAuth 2.0 Protected Resource Metadata provider and schema.
- `packages/vite`: generic Vite plugin, configuration loader, and file generator.
- `packages/sveltekit`: thin SvelteKit adapter around `@well-known-js/vite`.
- `examples/sveltekit`: integration example used by the workspace build.

Keep generic generation and Vite behavior in `@well-known-js/vite`. SvelteKit-specific defaults belong
in `@well-known-js/sveltekit`; do not duplicate the Vite implementation there.

## Development commands

Use pnpm from the repository root:

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
pnpm lint
```

Run a command for one package with a workspace filter, for example:

```sh
pnpm --filter @well-known-js/vite typecheck
pnpm --filter @well-known-js/apple-app-site-association test
```

Before handing off a change, run the checks relevant to the edited code. For cross-package changes,
run the full typecheck, test, build, formatting, and lint commands.

## Code conventions

- Write TypeScript in strict mode and use ESM imports.
- Include `.js` extensions in relative TypeScript imports so compiled Node ESM remains valid.
- Use tabs, double quotes, semicolons, trailing commas, and a 100-character print width, as configured
  in `.prettierrc`.
- Export public APIs from each package's `src/index.ts`.
- Use `import type` for type-only imports.
- Keep packages narrowly scoped and avoid introducing framework dependencies into `core` or provider
  packages.
- Preserve the `/.well-known/${string}` path contract for generated files.

## Package changes

When adding or moving a package:

1. Add its `package.json`, TypeScript configs, and `src/index.ts`.
2. Add required TypeScript project references in both the package and root `tsconfig.json`.
3. Use `workspace:*` for dependencies on other packages in this repository.
4. Update `pnpm-lock.yaml` with `pnpm install`.
5. Confirm the package builds independently and as part of `pnpm build`.

Do not edit generated `dist` files or `*.tsbuildinfo` files. They are build artifacts and are ignored
by Git.

## Tests

- Tests use Vitest and live beside the source as `*.test.ts`.
- Add focused tests for provider validation, generated paths, and serialized file bodies.
- For integration changes, verify that `examples/sveltekit` still builds and generates its AASA file
  under `static/.well-known/`.
- Avoid tests that require network access.

## Generated files and safety

The Vite plugin reads `well-known.config.ts` from the Vite project root and writes provider output to
Vite's `publicDir`. The SvelteKit adapter writes to `static` by default. Keep generated paths scoped
to the configured output directory and never commit secrets, credentials, or real production
application identifiers in examples or fixtures.
