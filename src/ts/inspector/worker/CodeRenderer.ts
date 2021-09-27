import "./helpers/PrismJSSetup";
import {
    cssBreakAfterComment,
    cssBreakAfterProperty,
    cssBreakAfterBlockStart,
    cssBreakAfterBlockEnd,
    cssBreakBeforeBlockEnd
} from "prismjs-token-stream-transformer/dist/prefabs/css";
import Prism from "prismjs";
import { AnyToken } from "prismjs-token-stream-transformer/dist/Tokens";

export type SupportedLanguage = "javascript" | "markup" | "css" | "plaintext";

type CodeHighlighter = (code: string) => string;

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

Prism.hooks.add("after-tokenize", (env) => {
    const tokens = env.tokens as AnyToken[];

    if (env.language === "css") {
        cssBreakAfterComment.applyTo(tokens);
        cssBreakAfterProperty.applyTo(tokens);
        cssBreakAfterBlockStart.applyTo(tokens);
        cssBreakAfterBlockEnd.applyTo(tokens);
        cssBreakBeforeBlockEnd.applyTo(tokens);
    }
});

export function renderCode(code: string, language: SupportedLanguage): string {
    const highlighter = highlighters.get(language);

    if (!highlighter) {
        return code;
    }

    return highlighter(code);
}
