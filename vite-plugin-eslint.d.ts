declare module 'vite-plugin-eslint' {
  import type { Plugin } from 'vite';

  const eslintPlugin: () => Plugin;

  export default eslintPlugin;
}
