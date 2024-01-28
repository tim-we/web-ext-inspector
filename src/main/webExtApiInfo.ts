export type ApiInfo = {
  permissions: string[];
  mdn?: string;
  description?: string;
  parameters: string[];
  chrome?: boolean;
};

export type ApiInfoRecord = Record<string, ApiInfo>;
