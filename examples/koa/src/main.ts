import Koa from "koa";
import { wellKnown } from "@well-known/koa";
import config from "../well-known.config.js";

const app = new Koa();
app.use(wellKnown(config));
app.listen(5109);
