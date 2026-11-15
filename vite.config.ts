import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Relative paths ensure GitHub Pages works under /Debateroulette/.
  base: "./",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: { host: "127.0.0.1" },
  build: { outDir: "dist" },
});
