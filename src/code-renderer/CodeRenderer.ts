import Prism from "./PrismJsWrapper";

export type SupportedLanguage = "javascript" | "json" | "markup" | "css" | "plaintext";

type CodeHighlighter = (code: string) => string;

const highlighters = new Map<SupportedLanguage, CodeHighlighter>();

highlighters.set("markup", (code) => Prism.highlight(code, Prism.languages.markup, "markup"));
highlighters.set("javascript", (code) =>
  Prism.highlight(code, Prism.languages.javascript, "javascript")
);
highlighters.set("json", (code) => Prism.highlight(code, Prism.languages.javascript, "javascript"));
highlighters.set("css", (code) => Prism.highlight(code, Prism.languages.css, "css"));
highlighters.set("plaintext", (code) => Prism.highlight(code, Prism.languages.plain, "plain"));

export function renderCode(code: string, language: SupportedLanguage): string {
  const highlighter = highlighters.get(language);

  let formattedCode = code;
  if (language === "json") {
    formattedCode = JSON.stringify(JSON.parse(code), null, 4);
  }

  if (!highlighter) {
    return formattedCode;
  }

  return highlighter(formattedCode);
}
