/* Vite env types - manual declaration to avoid loading vite/client type definition */
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
