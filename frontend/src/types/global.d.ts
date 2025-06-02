/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_JIRA_SERVICE_URL: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    workviewermfe_unmount?: () => void;
  }
}

export {}; // <- ✅ this is critical to ensure it's treated as a module
