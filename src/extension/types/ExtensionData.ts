export type ExtensionData = {
  id: string;
  downloadUrl: string;

  meta: {
    name: string;
    version: string;
    source: "amo" | "cws" | "file";
    author?: string;
    icon?: string;
    created?: string;
    lastUpdated?: string;
    manifestVersion: 2 | 3;
  };

  permissions: {
    required: number;
    optional: number;
    host: number;
  };

  files: {
    javascript: number;
    html: number;
    css: number;
    other: number;
    size: string;
  };

  dynamicAnalysis: {
    supported: boolean;
    jsType?: "classic" | "module" | "mixed";
    background: boolean;
  };

  translations: {
    locales: string[];
    messages: number;
    defaultLocale?: string;
    percentage?: number;
  };
};
