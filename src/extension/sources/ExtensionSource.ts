export type ExtensionSource =
  | {
      type: "amo" | "cws";
      id: string;
    }
  | { type: "file"; file: File }
  | { type: "url"; url: string };
