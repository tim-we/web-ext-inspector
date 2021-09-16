import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("plaintext", plaintext);

export function highlight(
    code: string,
    language: SupportedLanguage
): string {
    return hljs.highlight(code, {
        language,
    }).value;
}

export type SupportedLanguage =
    | "javascript"
    | "xml"
    | "css"
    | "plaintext";
