import Fastify from "fastify";
import wellKnown from "@well-known-js/fastify";
import config from "../well-known.config.js";

const app = Fastify();
await app.register(wellKnown, { config });
await app.listen({ port: 5107 });
