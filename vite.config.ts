// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Solo silencia el aviso de tamaño; tu build sigue siendo válida
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Agrupa dependencias en chunks lógicos
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-router"))
              return "vendor-react";
            if (
              id.includes("html2canvas") ||
              id.includes("jspdf") || // si usas jsPDF
              id.includes("xlsx")     // si usas xlsx
            )
              return "vendor-export";
            return "vendor"; // resto de vendors
          }
        },
      },
    },
  },
});
