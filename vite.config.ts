// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Si tu TS/Node no resuelve "node:path", usa: import path from "path";
import path from "node:path";
import { fileURLToPath } from "node:url";

// __dirname en ESM:
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            // Ojo con Windows: usa includes("react") en vez de "/react/"
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("html2canvas") ||
              id.includes("jspdf") ||
              id.includes("xlsx")
            ) {
              return "vendor-export";
            }
            return "vendor";
          }
          // si no coincide, deja que Vite decida (return undefined)
        },
      },
    },
  },
});
