import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  build: {
    lib: {
      formats: ["es"],
      name: "loro-slate",
      entry: "src/index.ts",
    },
    rollupOptions: {
      external: ["loro-crdt", "slate", "slate-react"],
    },
  },
});
