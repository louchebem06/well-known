import express from "express";
import { wellKnown } from "@well-known/express";

import wellKnownConfig from "../well-known.config.js";

const app = express();

app.use(wellKnown(wellKnownConfig));

app.get("/", (_request, response) => {
	response.send("Express well-known example");
});

app.listen(process.env.PORT ?? 3002);
