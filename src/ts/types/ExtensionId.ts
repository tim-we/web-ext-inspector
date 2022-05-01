export type ExtensionId =
    | {
          id: string;
          source: "firefox" | "chrome";
      }
    | {
          url: string;
          source: "url";
      };
