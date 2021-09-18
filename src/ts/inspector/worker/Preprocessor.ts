import hljs from "highlight.js/lib/core";
import hljs_javascript from "highlight.js/lib/languages/javascript";
import hljs_xml from "highlight.js/lib/languages/xml";
import hljs_css from "highlight.js/lib/languages/css";
import hljs_plaintext from "highlight.js/lib/languages/plaintext";

import css from "css";

hljs.registerLanguage("javascript", hljs_javascript);
hljs.registerLanguage("xml", hljs_xml);
hljs.registerLanguage("css", hljs_css);
hljs.registerLanguage("plaintext", hljs_plaintext);

export function highlight(code: string, language: SupportedLanguage): string {
    return hljs.highlight(code, {
        language,
    }).value;
}

export type SupportedLanguage = "javascript" | "xml" | "css" | "plaintext";

type CodeFormatter = (code: string) => string;
const formatters = new Map<SupportedLanguage, CodeFormatter>();
formatters.set("css", (code) =>
    css.stringify(css.parse(code, { silent: true }))
);

export function format(code: string, language: SupportedLanguage): string {
    const formatter = formatters.get(language);
    if (formatter) {
        return formatter(code);
    }

    return code;
}
