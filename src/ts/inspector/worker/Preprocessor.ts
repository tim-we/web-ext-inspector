import "./helpers/PrismJSSetup";
import Prism from "prismjs";

export type SupportedLanguage = "javascript" | "markup" | "css" | "plaintext";

type CodeFormatter = (code: string) => string;
type CodeHighlighter = (code: string) => string;

const formatters = new Map<SupportedLanguage, CodeFormatter>();
const highlighters = new Map<SupportedLanguage, CodeHighlighter>();
highlighters.set("markup", (code) =>
    Prism.highlight(code, Prism.languages.markup, "markup")
);
highlighters.set("javascript", (code) =>
    Prism.highlight(code, Prism.languages.javascript, "javascript")
);
highlighters.set("css", (code) =>
    Prism.highlight(code, Prism.languages.css, "css")
);
highlighters.set("plaintext", (code) =>
    Prism.highlight(code, Prism.languages.plain, "plain")
);
// formatters.set("css", (code) =>
//     css.stringify(css.parse(code, { silent: true }))
// );

export function format(code: string, language: SupportedLanguage): string {
    const formatter = formatters.get(language);
    if (formatter) {
        return formatter(code);
    }

    return code;
}

export function highlight(code: string, language: SupportedLanguage): string {
    const highlighter = highlighters.get(language);

    if (!highlighter) {
        return code;
    }

    return highlighter(code);
}
