# @well-known-js/openid-configuration

Type-safe generator for OpenID Connect Discovery 1.0 provider metadata.

```sh
pnpm add @well-known-js/core @well-known-js/openid-configuration
```

```ts
openIdConfiguration({
	issuer: "https://id.example.com",
	authorization_endpoint: "https://id.example.com/authorize",
	token_endpoint: "https://id.example.com/token",
	jwks_uri: "https://id.example.com/jwks",
	response_types_supported: ["code"],
	subject_types_supported: ["public"],
	id_token_signing_alg_values_supported: ["RS256"],
});
```

Generates `/.well-known/openid-configuration` as `application/json`. Registered and custom metadata fields are preserved.

[OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
