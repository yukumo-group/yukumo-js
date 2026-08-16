import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "yukumo.js/lang/zh",
        replacement: path.resolve(__dirname, "../src/lang/zh/index.ts"),
      },
      {
        find: "yukumo.js/lang",
        replacement: path.resolve(__dirname, "../src/lang/index.ts"),
      },
      {
        find: "yukumo.js",
        replacement: path.resolve(__dirname, "../src/index.ts"),
      },
      {
        find: "v86",
        replacement: path.resolve(__dirname, "node_modules/v86"),
      },
    ],
  },
  optimizeDeps: {
    exclude: ["js7z-tools", "kanji2koe-openjtalk"],
  },
  assetsInclude: ["**/*.wasm"],
  build: {
    outDir: "../docs",
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
