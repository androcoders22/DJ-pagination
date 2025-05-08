import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configure esbuild options for the React plugin
      esbuild: {
        loader: "jsx", // Explicitly set the loader for JSX files
        // Include .js and .jsx files.
        // The plugin's default is usually /\.(t|j)sx?$/,
        // but being explicit here for .jsx might help.
        include: /.*\.jsx?$/, // Process all .js and .jsx files
      },
    }),
  ],
  server: {
    mime: {
      // Explicitly set MIME type for .jsx files
      ".jsx": "text/javascript",
    },
  },
});
