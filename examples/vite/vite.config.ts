import { wellKnown } from "@well-known-js/vite";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [wellKnown()] });
