# @well-known-js/agent-card

Generate and validate Agent2Agent (A2A) Agent Cards for
`/.well-known/agent-card.json`.

The schema follows the A2A Protocol 1.0 Agent Card model, including supported interfaces,
capabilities, skills, security schemes, security requirements, and optional JWS signatures.

## Installation

```sh
pnpm add @well-known-js/agent-card
```

## Usage

```ts
import { agentCard } from "@well-known-js/agent-card";

agentCard({
	name: "Research Agent",
	description: "Finds and summarizes primary sources.",
	supportedInterfaces: [
		{
			url: "https://agent.example.com/a2a/v1",
			protocolBinding: "HTTP+JSON",
			protocolVersion: "1.0",
		},
	],
	version: "1.0.0",
	capabilities: { streaming: true },
	defaultInputModes: ["text/plain"],
	defaultOutputModes: ["text/plain", "application/json"],
	skills: [
		{
			id: "research",
			name: "Research",
			description: "Researches a question using primary sources.",
			tags: ["research", "citations"],
		},
	],
});
```

The generated file uses `application/json` at:

```text
/.well-known/agent-card.json
```

The schema preserves unknown fields for forward compatibility with future A2A additions.

[A2A specification](https://a2a-protocol.org/latest/specification/) ·
[GitHub](https://github.com/louchebem06/well-known)
