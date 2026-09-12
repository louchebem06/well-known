import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { wellKnown } from "@well-known/hono";
import config from "../well-known.config.js";

const app = new Hono();
app.use(wellKnown(config));
serve({ fetch: app.fetch, port: 5108 });
