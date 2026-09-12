import { createWellKnownRouteHandlers } from "@well-known-js/next";

import wellKnownConfig from "../../../well-known.config";

export const { GET, HEAD } = createWellKnownRouteHandlers(wellKnownConfig);
