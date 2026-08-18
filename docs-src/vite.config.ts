import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  resolve: {
    alias: [
      {
        find: "yukumo.js/lang/zh",
        replacement: path.resolve(import.meta.dirname, "../src/lang/zh/index.ts"),
      },
      {
        find: "yukumo.js/lang/kanji2koe",
        replacement: path.resolve(
          import.meta.dirname,
          "../src/lang/kanji2koe/index.ts"
        ),
      },
      {
        find: "yukumo.js/lang",
        replacement: path.resolve(import.meta.dirname, "../src/lang/index.ts"),
      },
      {
        find: "yukumo.js",
        replacement: path.resolve(import.meta.dirname, "../src/index.ts"),
      },
      {
        find: "v86",
        replacement: path.resolve(import.meta.dirname, "node_modules/v86"),
      },
    ],
  },
  optimizeDeps: {
    exclude: ["js7z-tools"],
  },
  assetsInclude: ["**/*.wasm"],
  build: {
    outDir: "../docs",
    target: "esnext",
  },
  base: "./",
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    fs: {
      allow: [
        "../",
        "../../ax/pkg/"
      ],
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
