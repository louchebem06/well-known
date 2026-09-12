import { defineConfig } from "astro/config";
import wellKnown from "@well-known-js/astro";

export default defineConfig({ integrations: [wellKnown()] });
