/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_REAL_API: string;
  /** Disease KB moduli: 'true' | 'false'. Prod default = 'false'. */
  readonly VITE_FEATURE_DISEASE_KB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
