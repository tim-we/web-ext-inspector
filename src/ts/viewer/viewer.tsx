import * as Comlink from "comlink";
import * as Preact from "preact";

// create styles (in <head>)
import "highlight.js/styles/a11y-dark.css";
import "../../less/file-viewer.less";

type Props = {
    html: string;
    language?: string;
};

class FileViewer extends Preact.Component<Props> {
    public render() {
        const html = { __html: this.props.html };
        const codeClasses = ["hljs"];

        if (this.props.language) {
            codeClasses.push("language-" + this.props.language);
        }

        return (
            <>
                <div id="controls">
                    <button>beautify</button>
                </div>
                <div id="file-content">
                    <pre>
                        <code
                            class={codeClasses.join(" ")}
                            dangerouslySetInnerHTML={html}
                        ></code>
                    </pre>
                </div>
            </>
        );
    }
}

export class FileViewerAPI {
    public async show(
        filename: string,
        html: string,
        language: string
    ): Promise<void> {
        document.title = filename;

        Preact.render(
            <FileViewer html={html} language={language} />,
            document.body
        );
    }

    public ping(): string {
        return "pong";
    }
}

if (window.opener) {
    Comlink.expose(new FileViewerAPI(), Comlink.windowEndpoint(window.opener));
} else {
    Preact.render(
        <section id="error">Failed to connect with opener window.</section>,
        document.body
    );
}
