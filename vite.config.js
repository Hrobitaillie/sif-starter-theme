import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { designSystemPlugin } from './plugins/vite-design-system.js';
import { extractLucideSprite } from './plugins/extract-lucide-sprite.js';

export default defineConfig({
  plugins: [
    // Design System - must run before Tailwind to generate CSS
    extractLucideSprite(),
    designSystemPlugin({
      configPath: 'design-system.json',
      outputPath: 'assets/src/_design-system.css',
      generateTheme: true,
      generateUtilities: true,
    }),
    tailwindcss(),
  ],

  build: {
    // Output directory
    outDir: 'assets/dist',
    emptyOutDir: true,

    // Generate manifest for WordPress integration
    manifest: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'assets/src/main.js'),
      },
      output: {
        // Organize output files
        entryFileNames: '[name].[hash].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // CSS files
          if (assetInfo.name.endsWith('.css')) {
            return '[name].[hash].css';
          }
          // Other assets (images, fonts, etc.)
          return 'assets/[name].[hash].[ext]';
        },
      },
    },

    // Source maps for debugging
    sourcemap: true,

    // Minification with esbuild (faster than terser)
    minify: 'esbuild',
  },

  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    https: false,

    // Enable CORS for local development
    cors: true,

    // HMR configuration
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },

    // Watch options
    watch: {
      usePolling: false,
      // Watch design system config
      include: ['design-system.json'],
    },
  },

  // Resolve configuration
  resolve: {
    extensions: ['.js', '.json', '.css'],
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },
});
