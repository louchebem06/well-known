import { defineConfig } from "astro/config";
import wellKnown from "@well-known/astro";

export default defineConfig({ integrations: [wellKnown()] });
