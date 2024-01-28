export type ExtensionData = {
  id: string;
  downloadUrl: string;

  meta: {
    name: string;
    version: string;
    source: "amo" | "cws" | "file";
    locales: number;
    author?: string;
    icon?: string;
    created?: string;
    lastUpdated?: string;
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
};
