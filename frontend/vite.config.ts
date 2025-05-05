import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

const remoteName = "workviewermfe";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: remoteName,
      filename: `${remoteName}-remoteEntry.js`,
      exposes: {
        "./": "./src/App", // Or the main entry point of your app
        // You can expose other modules/components here if needed
      },
      shared: ["react", "react-dom"], // List your shared dependencies
      dev: true
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      "416cf27b-b0f0-4827-ba72-6c4f26038c96-00-2z1igbk4vduc7.pike.replit.dev",
    ],
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false, // Optional: Disable minification for easier debugging
  },
});
