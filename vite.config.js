import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import loadVersion from 'vite-plugin-package-version';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslintPlugin(), loadVersion(), tailwindcss()],
  test: {
    environment: 'node',
    provider: 'v8',
    env: {
      FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
    },
  },
});
