import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { wellKnown } from "@well-known-js/elysia";
import config from "../well-known.config.js";

new Elysia({ adapter: node() }).use(wellKnown(config)).listen(5110);
