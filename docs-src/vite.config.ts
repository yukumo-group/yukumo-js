import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "yukumo.js": path.resolve(__dirname, "../src/index.ts"),
      v86: path.resolve(__dirname, "node_modules/v86"),
    },
  },
  optimizeDeps: {
    exclude: ["js7z-tools"],
  },
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
