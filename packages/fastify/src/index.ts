import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { WellKnownConfig } from "@well-known/core";

export interface WellKnownFastifyOptions {
	config: WellKnownConfig;
}

const plugin: FastifyPluginAsync<WellKnownFastifyOptions> = async (fastify, options) => {
	const paths = new Set<string>();

	for (const provider of options.config.providers) {
		const file = provider.generate();

		if (paths.has(file.path)) {
			throw new Error(`Duplicate well-known provider path: ${file.path}`);
		}

		paths.add(file.path);
		fastify.get(file.path, (_request, reply) => {
			reply.type(file.contentType).send(file.body);
		});
	}
};

export const wellKnown = fastifyPlugin(plugin, { name: "@well-known/fastify" });
export default wellKnown;
