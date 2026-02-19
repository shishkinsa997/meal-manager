import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    base: isDev ? "/" : "/meal-manager/",
    build: {
      outDir: "build",
      emptyOutDir: true,
      sourcemap: isDev,
      minify: false,
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[hash][extname]",
          chunkFileNames: "assets/[name].[hash].js",
          entryFileNames: "assets/[name].[hash].js",
        },
      },
    },
    plugins: [tailwindcss()],

    server: {
      port: 3000,
      open: true,
      strictPort: true,
    },

    preview: {
      port: 8080,
      open: true,
    },
  };
});
