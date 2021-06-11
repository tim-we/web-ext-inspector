import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("plaintext", plaintext);

export function highlight(
    code: string,
    language: "xml" | "javascript" | "plaintext"
): string {
    return hljs.highlight(code, {
        language,
    }).value;
}
