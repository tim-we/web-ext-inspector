import type { ExtensionSource } from "../sources/ExtensionSource";

export type ExtensionSummary = {
  meta: {
    name: string;
    version: string;
    source: ExtensionSource["type"];
    author?: string;
    icon?: string;
    created?: string;
    lastUpdated?: string;
    manifestVersion: 2 | 3;
    size: string;
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
    json: number;
    other: number;
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
