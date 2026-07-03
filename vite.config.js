import { defineConfig } from 'vite';

export default defineConfig({
  base: '/office-football/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
          if (id.includes('node_modules/@supabase')) return 'supabase';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
