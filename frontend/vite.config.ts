import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'workviewermfe',
      filename: 'workviewermfe-remoteEntry.js',
      exposes: {
        './App': './src/bootstrap.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          eager: false, // ✅ must be false
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false, // ✅ must be false
        },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    modulePreload: false,
    rollupOptions: {
      inlineDynamicImports: false, // ✅ tell Rollup to allow chunks
      output: {
        format: 'es', // ✅ avoids systemjs/umd chunking issues
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
      preserveEntrySignatures: 'strict',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
