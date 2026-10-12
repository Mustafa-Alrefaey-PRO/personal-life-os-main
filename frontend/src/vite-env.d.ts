/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin, e.g. http://localhost:5207. Defaults to that value when unset. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
