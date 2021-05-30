import { Parser } from "htmlparser2";

type ScriptInfo = {
    src: string;
    type: string;
};

export function extractScripts(html: string): ScriptInfo[] {
    let scripts: ScriptInfo[] = [];

    const parser = new Parser({
        onopentag(name, attributes) {
            if (name === "script" && attributes.src) {
                scripts.push({
                    src: attributes.src,
                    type: attributes.type ?? "text/javascript",
                });
            }
        },
    });

    parser.write(html);
    parser.end();

    return scripts;
}
