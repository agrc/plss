/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVICE_NAME: string;
  readonly VITE_API_KEY: string;
  readonly VITE_DISCOVER_KEY: string;
  readonly VITE_FIREBASE_CONFIG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
