/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Undefined in the web build (falls back to the '/api' proxy). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
