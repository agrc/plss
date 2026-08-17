import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import loadVersion from 'vite-plugin-package-version';

const arcgisCorePath = new URL('./node_modules/@arcgis/core', import.meta.url).pathname;

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['firebase/analytics', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions', 'firebase/storage'],
  },
  plugins: [react(), eslintPlugin(), loadVersion(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@arcgis\/core\/(.*)$/,
        replacement: `${arcgisCorePath}/$1`,
      },
      {
        find: '@arcgis/core',
        replacement: arcgisCorePath,
      },
    ],
  },
  test: {
    environment: 'node',
    provider: 'v8',
    env: {
      FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
    },
  },
});
