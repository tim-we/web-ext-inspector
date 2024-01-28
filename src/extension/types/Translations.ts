export type Translations = Record<
  string,
  {
    message: string;
    description?: string;
    placeholders?: Record<
      string,
      {
        content: string;
        example?: string;
      }
    >;
  }
>;
