import { wellKnown } from "@well-known/vite";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [wellKnown()] });
